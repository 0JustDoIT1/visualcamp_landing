import { beforeEach, describe, expect, it } from "vitest";
import { createApplicationHandler, MAX_BODY_BYTES } from "@/lib/applications/handler";
import { MemoryApplicationRepository } from "@/lib/applications/memory-repository";
import { createApplicationService } from "@/lib/applications/service";
import { createMemoryRateLimiter } from "@/lib/http/rate-limit";

const EVENT_ID = "csat-2027-gaze-report";
/** 신청 기간 안의 고정 시각. 실행 날짜와 무관하게 결과가 같도록 주입한다. */
const FIXED_NOW = new Date("2026-12-10T12:00:00+09:00");

const validBody = {
  name: "김천지",
  email: "student@example.com",
  grade: "PRE_HIGH3",
  weakTypes: ["INFERENCE", "APPLICATION"],
  agreePrivacy: true,
  agreeMarketing: false,
  website: "",
};

let repository: MemoryApplicationRepository;
let now: Date;
let POST: ReturnType<typeof createApplicationHandler>;

/** 테스트마다 빈 저장소, 고정 시각, 순차 ID로 핸들러를 새로 만든다. */
function setup({ limit = 100 }: { limit?: number } = {}) {
  repository = new MemoryApplicationRepository();
  now = FIXED_NOW;
  let seq = 0;
  POST = createApplicationHandler({
    service: createApplicationService({
      repository,
      now: () => now,
      generateId: () => `app_${++seq}`,
    }),
    rateLimiter: createMemoryRateLimiter({ limit, windowMs: 60_000 }),
  });
}

/** 서버를 띄우지 않고 핸들러에 Request를 직접 넣는다. */
function call(
  body: unknown,
  {
    eventId = EVENT_ID,
    contentType = "application/json",
    raw,
  }: { eventId?: string; contentType?: string; raw?: string } = {},
) {
  const request = new Request(`http://localhost/api/events/${eventId}/applications`, {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": "203.0.113.1" },
    body: raw ?? JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ eventId }) });
}

beforeEach(() => setup());

describe("POST /api/events/{eventId}/applications", () => {
  describe("성공", () => {
    it("유효한 신청이면 201과 주입한 id·createdAt을 반환하고 1건 저장한다", async () => {
      const res = await call(validBody);

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual({ id: "app_1", createdAt: FIXED_NOW.toISOString() });
      expect(await repository.count(EVENT_ID)).toBe(1);
    });

    it("선택 필드(weakTypes, agreeMarketing, website) 없이도 신청된다", async () => {
      const { name, email, grade, agreePrivacy } = validBody;
      const res = await call({ name, email, grade, agreePrivacy });

      expect(res.status).toBe(201);
    });
  });

  describe("요청 형식", () => {
    it("깨진 JSON이면 400 INVALID_BODY", async () => {
      const res = await call(null, { raw: "{ broken json" });

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("JSON 배열 본문이면 400 INVALID_BODY", async () => {
      const res = await call([validBody]);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("Content-Type이 text/plain이면 415 UNSUPPORTED_MEDIA_TYPE", async () => {
      const res = await call(validBody, { contentType: "text/plain" });

      expect(res.status).toBe(415);
      expect((await res.json()).error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    it("본문이 10KB를 넘으면 413 PAYLOAD_TOO_LARGE", async () => {
      const res = await call({ ...validBody, name: "가".repeat(MAX_BODY_BYTES) });

      expect(res.status).toBe(413);
      expect((await res.json()).error.code).toBe("PAYLOAD_TOO_LARGE");
    });
  });

  describe("필드 검증", () => {
    it.each([
      ["name 1자", "name", { name: "김" }],
      ["name 21자", "name", { name: "가".repeat(21) }],
      ["이메일 형식 오류", "email", { email: "not-an-email" }],
      ["없는 grade", "grade", { grade: "HIGH_1" }],
      ["weakTypes 중복", "weakTypes", { weakTypes: ["INFERENCE", "INFERENCE"] }],
      ["weakTypes 4개", "weakTypes", { weakTypes: ["DETAIL", "INFERENCE", "APPLICATION", "VOCABULARY"] }],
      ["weakTypes에 없는 값", "weakTypes", { weakTypes: ["UNKNOWN"] }],
      ["agreePrivacy가 boolean 아님", "agreePrivacy", { agreePrivacy: "yes" }],
    ])("%s이면 422 VALIDATION_ERROR, fields.%s, 저장 0건", async (_label, field, patch) => {
      const res = await call({ ...validBody, ...patch });
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.fields).toHaveProperty(field);
      expect(await repository.count(EVENT_ID)).toBe(0);
    });

    it("name·email·grade가 동시에 잘못되면 fields 키가 정확히 세 개다", async () => {
      const res = await call({ ...validBody, name: "", email: "x", grade: undefined });
      const { error } = await res.json();

      expect(Object.keys(error.fields).sort()).toEqual(["email", "grade", "name"]);
    });

    it("공백·대문자 이메일로 신청한 뒤 정규화된 같은 이메일로 다시 신청하면 409", async () => {
      await call({ ...validBody, email: "  Student@Example.COM " });
      const res = await call({ ...validBody, email: "student@example.com" });

      expect(res.status).toBe(409);
      expect((await res.json()).error.code).toBe("ALREADY_APPLIED");
    });
  });

  describe("접수 규칙", () => {
    it("agreePrivacy가 false면 422 CONSENT_REQUIRED와 fields.agreePrivacy", async () => {
      const res = await call({ ...validBody, agreePrivacy: false });
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.error.code).toBe("CONSENT_REQUIRED");
      expect(body.error.fields).toHaveProperty("agreePrivacy");
      expect(await repository.count(EVENT_ID)).toBe(0);
    });

    it("같은 이메일로 다시 신청하면 409 ALREADY_APPLIED이고 저장은 1건 유지", async () => {
      await call(validBody);
      const res = await call(validBody);

      expect(res.status).toBe(409);
      expect((await res.json()).error.code).toBe("ALREADY_APPLIED");
      expect(await repository.count(EVENT_ID)).toBe(1);
    });

    it("없는 eventId면 404 EVENT_NOT_FOUND", async () => {
      const res = await call(validBody, { eventId: "unknown-event" });

      expect(res.status).toBe(404);
      expect((await res.json()).error.code).toBe("EVENT_NOT_FOUND");
    });

    it.each([
      ["시작 1초 전", "2026-11-19T23:59:59+09:00"],
      ["마감 시각 정각", "2027-01-05T00:00:00+09:00"],
    ])("%s이면 409 EVENT_CLOSED", async (_label, at) => {
      now = new Date(at);
      const res = await call(validBody);

      expect(res.status).toBe(409);
      expect((await res.json()).error.code).toBe("EVENT_CLOSED");
      expect(await repository.count(EVENT_ID)).toBe(0);
    });

    it("시작 시각 정각에는 신청할 수 있다", async () => {
      now = new Date("2026-11-20T00:00:00+09:00");
      const res = await call(validBody);

      expect(res.status).toBe(201);
    });
  });

  describe("남용 방지", () => {
    it("허니팟에 값이 있으면 201로 응답하지만 저장하지 않는다", async () => {
      const res = await call({ ...validBody, website: "https://spam.example" });

      expect(res.status).toBe(201);
      expect(await repository.count(EVENT_ID)).toBe(0);
    });

    it("한도 2회일 때 같은 IP의 3번째 요청은 429와 Retry-After: 60", async () => {
      setup({ limit: 2 });
      await call({ ...validBody, email: "a@example.com" });
      await call({ ...validBody, email: "b@example.com" });
      const res = await call({ ...validBody, email: "c@example.com" });

      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBe("60");
      expect((await res.json()).error.code).toBe("RATE_LIMITED");
    });
  });
});
