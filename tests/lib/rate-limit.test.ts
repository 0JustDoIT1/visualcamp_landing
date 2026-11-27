import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter, getClientIp } from "@/lib/http/rate-limit";

describe("createMemoryRateLimiter", () => {
  it("한도를 넘으면 막고, 윈도우가 지나면 다시 허용한다", () => {
    let time = 0;
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1000, now: () => time });

    expect(limiter.hit("ip").allowed).toBe(true);
    expect(limiter.hit("ip").allowed).toBe(false);

    time = 1000;
    expect(limiter.hit("ip").allowed).toBe(true);
  });

  it("서로 다른 키(IP)는 따로 센다", () => {
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.hit("a").allowed).toBe(true);
    expect(limiter.hit("b").allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("x-forwarded-for의 첫 번째 주소를 사용한다", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });

    expect(getClientIp(request)).toBe("203.0.113.1");
  });
});
