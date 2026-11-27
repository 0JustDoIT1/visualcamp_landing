import { isEventOpen, type EventDefinition } from "@/lib/events/events";
import type { Application, ApplicationRepository } from "./repository";
import type { ApplicationInput } from "./schema";

export type ApplyFailureCode = "EVENT_CLOSED" | "CONSENT_REQUIRED" | "ALREADY_APPLIED";

export type ApplyResult =
  | { ok: true; application: Application }
  | { ok: false; code: ApplyFailureCode };

export type ApplicationServiceDeps = {
  repository: ApplicationRepository;
  now: () => Date;
  generateId: () => string;
};

/**
 * 이벤트 접수 규칙을 판정하고, 통과하면 저장한다.
 * 형식 검증은 schema, 봇(허니팟) 판정은 handler가 먼저 끝낸 입력을 받는다.
 */
export function createApplicationService({ repository, now, generateId }: ApplicationServiceDeps) {
  return {
    /** 신청 기간 → 필수 동의 → 저장(중복이면 실패) 순서로 확인한다. */
    async apply(event: EventDefinition, input: ApplicationInput): Promise<ApplyResult> {
      // 기간 판정과 createdAt이 같은 순간을 가리키도록 한 번만 읽는다.
      const current = now();

      if (!isEventOpen(event, current)) {
        return { ok: false, code: "EVENT_CLOSED" };
      }

      if (!input.agreePrivacy) {
        return { ok: false, code: "CONSENT_REQUIRED" };
      }

      // 허니팟(website)이 섞이지 않도록 필드를 하나씩 옮긴다.
      const application: Application = {
        id: generateId(),
        eventId: event.id,
        name: input.name,
        email: input.email,
        grade: input.grade,
        weakTypes: input.weakTypes,
        agreePrivacy: input.agreePrivacy,
        agreeMarketing: input.agreeMarketing,
        createdAt: current,
      };

      const saved = await repository.save(application);
      if (!saved.ok) {
        return { ok: false, code: "ALREADY_APPLIED" };
      }

      return { ok: true, application };
    },
  };
}

export type ApplicationService = ReturnType<typeof createApplicationService>;
