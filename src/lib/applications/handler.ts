import { findEvent } from "@/lib/events/events";
import { errorResponse } from "@/lib/http/errors";
import { getClientIp, type RateLimiter } from "@/lib/http/rate-limit";
import { applicationSchema, toFieldErrors } from "./schema";
import type { ApplicationService } from "./service";

/** 요청 본문 최대 크기 (바이트). 한글은 한 글자가 3바이트라 글자 수가 아니라 바이트로 센다. */
export const MAX_BODY_BYTES = 10 * 1024;

export type ApplicationHandlerDeps = {
  service: ApplicationService;
  rateLimiter: RateLimiter;
};

type RouteContext = { params: Promise<{ eventId: string }> };

export type CreatedBody = { id: string; createdAt: string };

/**
 * POST /api/events/{eventId}/applications
 * 의존성을 주입받아 Route Handler를 만든다. 테스트에서는 빈 저장소와 고정 시각을 넣는다.
 * 처리 순서는 GUIDE 2장을 따른다. 앞에서 실패하면 뒤는 실행하지 않는다.
 */
export function createApplicationHandler({ service, rateLimiter }: ApplicationHandlerDeps) {
  return async function POST(request: Request, context: RouteContext): Promise<Response> {
    try {
      // 1. rate limit
      const limit = rateLimiter.hit(getClientIp(request));
      if (!limit.allowed) {
        return errorResponse("RATE_LIMITED", {
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        });
      }

      // 2. 이벤트 조회
      const { eventId } = await context.params;
      const event = findEvent(eventId);
      if (!event) {
        return errorResponse("EVENT_NOT_FOUND");
      }

      // 3. Content-Type
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().startsWith("application/json")) {
        return errorResponse("UNSUPPORTED_MEDIA_TYPE");
      }

      // 4. 본문 크기
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
        return errorResponse("PAYLOAD_TOO_LARGE");
      }

      // 5. JSON 파싱, 객체 여부
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        return errorResponse("INVALID_BODY");
      }
      if (typeof json !== "object" || json === null || Array.isArray(json)) {
        return errorResponse("INVALID_BODY");
      }

      // 6. 스키마 검증·정규화
      const parsed = applicationSchema.safeParse(json);
      if (!parsed.success) {
        return errorResponse("VALIDATION_ERROR", { fields: toFieldErrors(parsed.error) });
      }

      // 7. 허니팟: 값이 있으면 저장하지 않고 성공처럼 응답한다 (봇이 차단 여부를 알지 못하게).
      if (parsed.data.website !== "") {
        const body: CreatedBody = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        return Response.json(body, { status: 201 });
      }

      // 8. 비즈니스 규칙: 기간 → 동의 → 저장
      const result = await service.apply(event, parsed.data);
      if (!result.ok) {
        if (result.code === "CONSENT_REQUIRED") {
          return errorResponse("CONSENT_REQUIRED", {
            fields: { agreePrivacy: "개인정보 수집·이용에 동의해 주세요." },
          });
        }
        return errorResponse(result.code);
      }

      // 9. 성공
      const body: CreatedBody = {
        id: result.application.id,
        createdAt: result.application.createdAt.toISOString(),
      };
      return Response.json(body, { status: 201 });
    } catch (error) {
      // 내부 정보는 응답에 넣지 않고 서버 로그에만 남긴다.
      console.error("[applications] unexpected error", error);
      return errorResponse("INTERNAL_ERROR");
    }
  };
}
