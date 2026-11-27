import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

type CommonProps = {
  variant?: Variant;
  /** md: 본문 CTA·제출(48px), sm: 헤더 등 좁은 자리(40px) */
  size?: Size;
  children: ReactNode;
  className?: string;
};

/** href가 있으면 링크(<a>): 섹션 이동·외부 링크 */
type LinkButtonProps = CommonProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof CommonProps | "href"
  >;

/** href가 없으면 <button>: 폼 제출 등 동작 */
type ActionButtonProps = CommonProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof CommonProps
  >;

export type ButtonProps = LinkButtonProps | ActionButtonProps;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control text-body font-semibold " +
  "transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

// 같은 속성의 클래스는 적힌 순서가 아니라 CSS 생성 순서로 이기므로, className으로 덮어쓰지 말고 size로 고른다.
const SIZES: Record<Size, string> = {
  md: "min-h-12 px-6",
  sm: "min-h-10 px-4",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong disabled:hover:bg-accent",
  secondary: "border border-border bg-surface text-ink hover:border-ink disabled:hover:border-border",
};

/**
 * 공통 버튼. 겉모양은 같게, 요소는 용도에 맞게(링크는 <a>, 동작은 <button>) 렌더링해
 * 키보드·스크린리더 동작이 올바르도록 한다.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  if (rest.href !== undefined) {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {children}
      </a>
    );
  }

  // 폼 안에서 의도치 않게 제출되지 않도록 기본 type은 "button"
  const { type = "button", ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...buttonRest} type={type} className={classes}>
      {children}
    </button>
  );
}
