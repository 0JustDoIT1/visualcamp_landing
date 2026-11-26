export type EventDefinition = {
  id: string;
  title: string;
  /** 신청 시작 (포함) */
  opensAt: Date;
  /** 신청 마감 (미포함) */
  closesAt: Date;
};

const CSAT_2027_GAZE_REPORT: EventDefinition = {
  id: "csat-2027-gaze-report",
  title: "2027 수능 비문학, 35일 다시 읽기",
  // 서버(Vercel)는 UTC이므로 KST 오프셋을 명시한다.
  // 2027학년도 수능(2026-11-19) 다음 날부터 신청을 받는다.
  opensAt: new Date("2026-11-20T00:00:00+09:00"),
  closesAt: new Date("2027-01-05T00:00:00+09:00"),
};

// Map은 객체 기본 속성(toString, __proto__ 등)이 키로 조회되지 않는다.
const EVENTS = new Map<string, EventDefinition>([
  [CSAT_2027_GAZE_REPORT.id, CSAT_2027_GAZE_REPORT],
]);

export function findEvent(eventId: string): EventDefinition | undefined {
  return EVENTS.get(eventId);
}

/** 시작 시각은 포함하고 마감 시각은 포함하지 않는다. */
export function isEventOpen(event: EventDefinition, now: Date): boolean {
  return now >= event.opensAt && now < event.closesAt;
}
