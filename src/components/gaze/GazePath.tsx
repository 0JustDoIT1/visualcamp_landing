/**
 * Hero의 지문 목업과 시선 경로.
 * 지문 글자와 시선 표시를 하나의 SVG 좌표계에 그려 화면 폭이 바뀌어도 점이 항상 같은 글자 위에 있게 한다.
 * 애니메이션은 motion-safe에서만 1회 재생하고, 움직임 줄이기 설정이면 완성 상태로 보인다.
 */

/** 자작 지문 (간격 반복 학습). 줄바꿈을 고정하고 textLength로 줄 폭을 맞춘다. */
const LINES = [
  "사람은 새로 배운 내용을 하루가 지나면 절반",
  "이상 잊는다. 그러나 잊어 갈 무렵 다시 떠올리면",
  "기억은 이전보다 오래 남는다. 이처럼 간격을",
  "두고 되살리는 과정을 반복하면, 같은 내용을",
  "한 번에 오래 공부할 때보다 기억이 단단해진다.",
] as const;

const TEXT_X = 32;
const TEXT_WIDTH = 456;
const FIRST_BASELINE = 104;
const LINE_HEIGHT = 40;

/** 줄 번호(0부터)의 글자 가운데 높이 */
const midY = (line: number) => FIRST_BASELINE + line * LINE_HEIGHT - 7;

/**
 * 시선이 멈춘 지점 (읽은 순서). x는 해당 낱말의 가운데, r은 머문 시간에 비례.
 * 5번 "되살리는"에서 오래 머문 뒤 2번 "잊어 갈 무렵"으로 되돌아간다.
 */
const FIXATIONS = [
  { x: 210.5, line: 0, r: 6, delay: 0.3 }, // 배운 내용
  { x: 287.7, line: 1, r: 10, delay: 0.6 }, // 잊어 갈 무렵
  { x: 268.1, line: 2, r: 6, delay: 0.9 }, // 오래 남는다
  { x: 453.5, line: 2, r: 8, delay: 1.2 }, // 간격을
  { x: 131.0, line: 3, r: 13, delay: 1.5 }, // 되살리는 (오래 머묾)
  { x: 427.5, line: 4, r: 7, delay: 3.1 }, // 단단해진다 (다시 읽은 뒤 계속)
] as const;

const REGRESSION_DELAY = 1.9; // 5번 이후 되돌아감
const REREAD_DELAY = 2.8; // 2번 지점 다시 읽기

const from = FIXATIONS[4];
const to = FIXATIONS[1];
const REGRESSION_PATH = `M ${from.x + 4} ${midY(from.line) - from.r - 2} C ${from.x + 10} ${midY(from.line) - 70}, ${to.x - 90} ${midY(to.line) - 40}, ${to.x - 14} ${midY(to.line) - 12}`;

export function GazePath() {
  return (
    <figure className="w-full">
      <svg
        viewBox="0 0 520 304"
        role="img"
        aria-labelledby="gaze-title gaze-desc"
        className="h-auto w-full"
      >
        <title id="gaze-title">지문 위 시선 경로</title>
        <desc id="gaze-desc">
          수능 비문학 지문을 읽는 동안 시선이 멈춘 지점이 점으로 표시되고, 넷째 줄 &lsquo;되살리는&rsquo;에서 오래
          머문 뒤 둘째 줄 &lsquo;잊어 갈 무렵&rsquo;으로 되돌아가 다시 읽는 경로가 곡선으로 그려진 그림.
        </desc>

        <defs>
          <marker
            id="gaze-arrow"
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
        <rect x="1" y="1" width="518" height="302" rx="16" className="fill-surface stroke-border" />
        <text x={TEXT_X} y="46" className="fill-muted font-serif text-[13px]">
          [1~3] 다음 글을 읽고 물음에 답하시오.
        </text>
        <line x1={TEXT_X} y1="62" x2={TEXT_X + TEXT_WIDTH} y2="62" className="stroke-border" />

        {/* 지문 */}
        {LINES.map((line, i) => (
          <text
            key={line}
            x={TEXT_X}
            y={FIRST_BASELINE + i * LINE_HEIGHT}
            textLength={TEXT_WIDTH}
            lengthAdjust="spacing"
            className="fill-ink font-serif text-[19px]"
          >
            {line}
          </text>
        ))}

        {/* 멈춘 지점 */}
        {FIXATIONS.map((f) => (
          <circle
            key={`${f.x}-${f.line}`}
            cx={f.x}
            cy={midY(f.line)}
            r={f.r}
            style={{ animationDelay: `${f.delay}s` }}
            className="origin-center fill-accent/25 stroke-accent stroke-[1.5] [transform-box:fill-box] motion-safe:animate-gaze-dot"
          />
        ))}

        {/* 되돌아간 경로 */}
        <path
          d={REGRESSION_PATH}
          pathLength={1}
          strokeDasharray={1}
          markerEnd="url(#gaze-arrow)"
          style={{ animationDelay: `${REGRESSION_DELAY}s` }}
          className="fill-none stroke-accent stroke-2 motion-safe:animate-gaze-path"
        />

        {/* 다시 읽은 지점 */}
        <circle
          cx={to.x}
          cy={midY(to.line)}
          r={to.r + 7}
          style={{ animationDelay: `${REREAD_DELAY}s` }}
          className="origin-center fill-none stroke-accent stroke-[1.5] [transform-box:fill-box] motion-safe:animate-gaze-dot"
        />
      </svg>

      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full border-[1.5px] border-accent bg-accent/25" />
          시선이 멈춘 곳 (클수록 오래)
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 bg-accent" />
          앞 문장으로 되돌아간 경로
        </span>
      </figcaption>
    </figure>
  );
}
