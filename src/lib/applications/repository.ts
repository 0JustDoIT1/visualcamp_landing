import type { ApplicationInput } from "./schema";

/** 저장되는 신청. 허니팟(website)은 저장 대상이 아니다. */
export type Application = Omit<ApplicationInput, "website"> & {
  id: string;
  eventId: string;
  createdAt: Date;
};

export type SaveResult = { ok: true } | { ok: false; reason: "DUPLICATE" };

export interface ApplicationRepository {
  /**
   * (eventId, email) 조합이 이미 있으면 저장하지 않고 DUPLICATE를 반환한다.
   * 중복 확인과 저장을 한 번에 처리한다 (DB unique 제약과 같은 의미).
   */
  save(application: Application): Promise<SaveResult>;
  count(eventId: string): Promise<number>;
}
