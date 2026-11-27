import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

type CommonProps = {
  variant?: Variant;
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
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-6 text-body font-semibold " +
  "transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong disabled:hover:bg-accent",
  secondary: "border border-border bg-surface text-ink hover:border-ink disabled:hover:border-border",
};

/**
 * 공통 버튼. 겉모양은 같게, 요소는 용도에 맞게(링크는 <a>, 동작은 <button>) 렌더링해
 * 키보드·스크린리더 동작이 올바르도록 한다.
 */
export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

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
