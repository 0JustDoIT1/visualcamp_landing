import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

/** 지문 영역 전용 명조 (수능 시험지 느낌). 지문에만 쓰므로 미리 받지 않는다. */
const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "600"],
  preload: false,
  display: "swap",
});

/**
 * 본문 글꼴 Pretendard (SIL OFL). Google Fonts에 없어서 CDN의 동적 서브셋을 버전 고정으로 불러온다.
 * 페이지에 쓰인 글자 범위의 조각만 받는다. 실패하면 globals.css의 시스템 고딕으로 대체된다.
 */
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

/** 상세 메타데이터(Open Graph, favicon)는 F2에서 추가한다. */
export const metadata: Metadata = {
  title: "2027 수능 비문학, 35일 다시 읽기 | 천지문",
  description:
    "올해 수능 비문학, 당신의 눈은 어디서 멈췄을까. 시선추적 리포트로 내 읽기를 확인하고 35일 동안 다시 읽어 보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href={PRETENDARD_CSS} crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
