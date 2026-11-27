import { createMemoryRateLimiter, type RateLimiter } from "@/lib/http/rate-limit";
import { createApplicationHandler } from "./handler";
import { MemoryApplicationRepository } from "./memory-repository";
import { createApplicationService } from "./service";

/**
 * 실제 런타임 의존성 조립. 현재 시각·UUID를 직접 만드는 곳은 여기(와 허니팟 응답)뿐이다.
 * 개발 서버가 모듈을 다시 불러와도(HMR) 저장소와 rate limit 기록이 유지되도록 globalThis에 둔다.
 */
const globalForApplications = globalThis as typeof globalThis & {
  __applicationRepository?: MemoryApplicationRepository;
  __applicationRateLimiter?: RateLimiter;
};

const repository = (globalForApplications.__applicationRepository ??=
  new MemoryApplicationRepository());

const rateLimiter = (globalForApplications.__applicationRateLimiter ??= createMemoryRateLimiter({
  limit: 5,
  windowMs: 60_000,
}));

export const postApplication = createApplicationHandler({
  service: createApplicationService({
    repository,
    now: () => new Date(),
    generateId: () => crypto.randomUUID(),
  }),
  rateLimiter,
});
