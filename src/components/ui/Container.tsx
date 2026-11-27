import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** 콘텐츠 최대 폭(1152px)과 좌우 여백(모바일 20px, 768px 이상 32px)을 통일한다. */
export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`mx-auto w-full max-w-6xl px-5 md:px-8 ${className}`}>{children}</div>;
}
