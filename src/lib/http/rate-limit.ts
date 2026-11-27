export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface RateLimiter {
  hit(key: string): RateLimitResult;
}

/**
 * 고정 윈도우 방식의 인메모리 rate limiter.
 * 키(IP)마다 윈도우 시작 시각과 횟수를 기록하고, 윈도우가 지나면 새로 센다.
 * 서버리스 인스턴스끼리 공유되지 않는 best-effort 방어선이다.
 */
export function createMemoryRateLimiter(options: {
  limit: number;
  windowMs: number;
  /** 테스트에서 시간을 직접 움직이기 위해 주입한다. */
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs, now = Date.now } = options;
  const windows = new Map<string, { startedAt: number; count: number }>();

  return {
    hit(key) {
      const current = now();
      const window = windows.get(key);

      if (!window || current - window.startedAt >= windowMs) {
        windows.set(key, { startedAt: current, count: 1 });
        return { allowed: true };
      }

      if (window.count >= limit) {
        const retryAfterMs = window.startedAt + windowMs - current;
        return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
      }

      window.count += 1;
      return { allowed: true };
    },
  };
}

/** x-forwarded-for의 첫 주소 → x-real-ip → "unknown" 순서로 클라이언트 IP를 고른다. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
