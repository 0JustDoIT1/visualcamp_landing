import { GazePath } from "@/components/gaze/GazePath";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { findEvent } from "@/lib/events/events";

const EVENT_ID = "csat-2027-gaze-report";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=camp.visual.cheonjimun";

const formatKstDate = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(date);

/** 신청 기간 표시. 마감은 미포함이라 마감 1ms 전 날짜(마지막 신청 가능일)를 보여 준다. */
function formatPeriod() {
  const event = findEvent(EVENT_ID);
  if (!event) return null;
  const lastDay = new Date(event.closesAt.getTime() - 1);
  return `${formatKstDate(event.opensAt)} – ${formatKstDate(lastDay)}`;
}

/**
 * 첫 화면. 왼쪽은 메시지와 신청 CTA, 오른쪽은 지문 위 시선 경로(증거).
 * 모바일은 카피 → 목업 순서의 세로 배치.
 */
export function Hero() {
  const period = formatPeriod();

  return (
    <section id="hero" aria-labelledby="hero-title" className="scroll-mt-16 py-section">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-caption font-semibold text-accent">2027 수능 비문학, 35일 다시 읽기</p>
          <h1 id="hero-title" className="mt-4 text-display text-ink">
            올해 수능 비문학,
            <br />
            당신의 눈은 어디서 멈췄을까.
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted">
            내가 다시 읽은 문장과 약한 유형을 시선으로 확인하고, 35일 동안 다시 읽어 보세요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#event">35일 다시 읽기 신청</Button>
            <Button href={PLAY_STORE_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
              앱 살펴보기
            </Button>
          </div>
          {period && <p className="mt-4 text-caption text-muted">신청 기간 {period}</p>}
        </div>

        <GazePath />
      </Container>
    </section>
  );
}
