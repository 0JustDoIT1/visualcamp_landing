import { Header } from "@/components/sections/Header";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Phase D·E에서 채울 섹션 자리. id는 헤더 CTA·앵커 이동에 쓴다. */
const SECTIONS = [
  { id: "problem", label: "Problem", step: "D3" },
  { id: "how", label: "How", step: "D4" },
  { id: "features", label: "Features", step: "D5" },
  { id: "event", label: "Event", step: "E1·E2" },
  { id: "faq", label: "FAQ", step: "D6" },
] as const;

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* D2에서 Hero로 교체. 버튼은 상태 확인용으로 미리 둔다 (문구는 GUIDE 1장). */}
        <section id="hero" aria-labelledby="hero-title" className="scroll-mt-16 py-section">
          <Container>
            <SectionHeading id="hero-title" eyebrow="Hero 자리 (D2)" title="올해 수능 비문학, 당신의 눈은 어디서 멈췄을까." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#event">35일 다시 읽기 신청</Button>
              <Button href="#" variant="secondary">
                앱 살펴보기
              </Button>
            </div>
          </Container>
        </section>

        {SECTIONS.map(({ id, label, step }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-title`}
            className="scroll-mt-16 border-t border-border py-section"
          >
            <Container>
              <SectionHeading id={`${id}-title`} eyebrow={`${label} 자리 (${step})`} title={label} />
            </Container>
          </section>
        ))}
      </main>

      {/* D7에서 교체 */}
      <footer className="border-t border-border">
        <Container className="py-10">
          <p className="text-caption text-muted">Footer 자리 (D7)</p>
        </Container>
      </footer>
    </>
  );
}
