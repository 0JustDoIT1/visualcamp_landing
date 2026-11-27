import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** 섹션의 aria-labelledby와 연결할 제목 id */
  id: string;
  /** 제목 위 작은 머리말 (선택) */
  eyebrow?: string;
  title: ReactNode;
  /** 제목 아래 설명 (선택) */
  description?: ReactNode;
  align?: "left" | "center";
};

/** 섹션 제목 묶음: 머리말 → 제목(h2) → 설명. 모든 섹션이 같은 위계를 쓰게 한다. */
export function SectionHeading({ id, eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="text-caption font-semibold text-accent">{eyebrow}</p>}
      <h2 id={id} className={`text-h2 text-ink ${eyebrow ? "mt-3" : ""}`}>
        {title}
      </h2>
      {description && <p className="mt-4 text-body-lg text-muted">{description}</p>}
    </div>
  );
}
