import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * 문제 제기. "시간이 부족했다"는 기억을 "같은 문장을 다시 읽고 있었다"로 바꿔,
 * 이해가 끊긴 지점을 찾아 주는 시선추적의 필요로 잇는다.
 * 비주얼은 정지 상태 (모션은 Hero에서만).
 */
export function Problem() {
  return (
    <section id="problem" aria-labelledby="problem-title" className="scroll-mt-16 border-t border-border py-section">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* 모바일은 글 → 카드, 데스크톱은 카드(왼쪽) · 글(오른쪽)로 Hero와 좌우를 번갈아 쓴다 */}
        <div className="lg:order-2">
          <SectionHeading
            id="problem-title"
            eyebrow="왜 시간이 부족했을까"
            title="시간이 부족한 게 아니라, 같은 문장을 다시 읽고 있던 것"
            description="비문학에서 시간이 모자랐다면, 문제를 늦게 푼 게 아니라 한 문장 앞에서 여러 번 되돌아갔기 때문일 수 있습니다. 어디서 되돌아갔는지 알면, 무엇을 연습해야 할지도 보입니다."
          />
        </div>

        <div className="lg:order-1">
          <RereadPassage />
        </div>
      </Container>
    </section>
  );
}

/** 지문 좌표 (Hero의 GazePath와 같은 방식: 글자와 표시를 한 SVG 좌표계에) */
const TEXT_X = 32;
const TEXT_WIDTH = 456;
const BASELINES = [104, 176, 216] as const;
/** 되돌아간 구절: 둘째 줄 "수입 물가의 하락이 이를" ~ 셋째 줄 "상쇄할 수도 있다." */
const PHRASE_START_X = 249;
const PHRASE_END_X = TEXT_X + TEXT_WIDTH;
const LINE3_END_X = 182;
/** 같은 구절로 세 번 되돌아간 고리 (높이만 다르게) */
const LOOP_HEIGHTS = [16, 27, 38] as const;
const LOOP_BASE_Y = BASELINES[1] - 24;

function RereadPassage() {
  return (
    <svg viewBox="0 0 520 280" role="img" aria-labelledby="reread-title reread-desc" className="h-auto w-full">
      <title id="reread-title">같은 구절로 되돌아간 시선</title>
      <desc id="reread-desc">
        경제 지문의 &lsquo;수입 물가의 하락이 이를 상쇄할 수도 있다&rsquo; 구절에서 시선이 세 번 되돌아가 다시
        읽은 모습.
      </desc>

      <defs>
        <marker
          id="reread-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
        </marker>
      </defs>

      {/* 시험지 카드 */}
      <rect x="1" y="1" width="518" height="278" rx="16" className="fill-surface stroke-border" />
      <text x={TEXT_X} y="46" className="fill-muted font-serif text-[13px]">
        [4~6] 다음 글을 읽고 물음에 답하시오.
      </text>
      <line x1={TEXT_X} y1="62" x2={PHRASE_END_X} y2="62" className="stroke-border" />

      {/* 지문 */}
      <text
        x={TEXT_X}
        y={BASELINES[0]}
        textLength={TEXT_WIDTH}
        lengthAdjust="spacing"
        className="fill-ink font-serif text-[19px]"
      >
        기준 금리가 오르면 예금 이자가 늘어 소비가 줄지만,
      </text>
      <text
        x={TEXT_X}
        y={BASELINES[1]}
        textLength={TEXT_WIDTH}
        lengthAdjust="spacing"
        className="fill-ink font-serif text-[19px]"
      >
        환율이 함께 움직이면 수입 물가의 하락이 이를
      </text>
      <text x={TEXT_X} y={BASELINES[2]} className="fill-ink font-serif text-[19px]">
        상쇄할 수도 있다.
      </text>

      {/* 되돌아간 구절 밑줄 */}
      <line
        x1={PHRASE_START_X}
        y1={BASELINES[1] + 7}
        x2={PHRASE_END_X}
        y2={BASELINES[1] + 7}
        className="stroke-accent stroke-2"
      />
      <line
        x1={TEXT_X}
        y1={BASELINES[2] + 7}
        x2={LINE3_END_X}
        y2={BASELINES[2] + 7}
        className="stroke-accent stroke-2"
      />

      {/* 구절 끝에서 처음으로 세 번 되돌아간 고리 */}
      {LOOP_HEIGHTS.map((h) => (
        <path
          key={h}
          d={`M ${PHRASE_END_X - 8} ${LOOP_BASE_Y} Q ${(PHRASE_START_X + PHRASE_END_X) / 2} ${LOOP_BASE_Y - h * 2} ${PHRASE_START_X + 8} ${LOOP_BASE_Y}`}
          markerEnd="url(#reread-arrow)"
          className="fill-none stroke-accent stroke-[1.5]"
        />
      ))}

      {/* 꼬리표 */}
      <rect x="356" y="232" width="132" height="28" rx="14" className="fill-accent" />
      <text x="422" y="251" textAnchor="middle" className="fill-accent-ink text-[13px] font-semibold">
        3번 다시 읽음
      </text>
    </svg>
  );
}
