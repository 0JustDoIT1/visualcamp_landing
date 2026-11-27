"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** 이만큼 내려가면 배경·경계선을 켠다 (px) */
const SCROLL_THRESHOLD = 8;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
/** 서버 렌더링 때는 맨 위 상태(투명)로 그린다. */
const getServerScrolled = () => false;

/**
 * 고정 헤더. 어디를 읽고 있든 신청 CTA가 보이게 한다.
 * 맨 위에서는 투명해서 Hero와 하나로 보이고, 스크롤하면 배경·경계선이 생겨 아래 내용과 겹쳐도 읽힌다.
 */
export function Header() {
  const scrolled = useSyncExternalStore(subscribe, getScrolled, getServerScrolled);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? "border-border bg-bg/90 backdrop-blur" : "border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <a
          href="#hero"
          className="rounded-control text-h3 font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          천지문
        </a>
        <Button href="#event" size="sm">
          신청하기
        </Button>
      </Container>
    </header>
  );
}
