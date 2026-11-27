import type { Application, ApplicationRepository, SaveResult } from "./repository";

/**
 * 프로세스 메모리에 저장하는 구현체.
 * 서버리스 인스턴스끼리 공유되지 않으므로 중복 방지는 같은 인스턴스 안에서만 보장된다.
 */
export class MemoryApplicationRepository implements ApplicationRepository {
  private readonly store = new Map<string, Application>();

  async save(application: Application): Promise<SaveResult> {
    const key = toKey(application.eventId, application.email);
    if (this.store.has(key)) {
      return { ok: false, reason: "DUPLICATE" };
    }
    this.store.set(key, application);
    return { ok: true };
  }

  async count(eventId: string): Promise<number> {
    let total = 0;
    for (const application of this.store.values()) {
      if (application.eventId === eventId) total += 1;
    }
    return total;
  }
}

// 이메일 형식을 통과할 수 없는 널 문자로 구분해 서로 다른 조합이 같은 키가 되지 않게 한다.
function toKey(eventId: string, email: string): string {
  return `${eventId}\u0000${email}`;
}
