# 천지문 랜딩페이지 진행 가이드

빈 폴더에서 시작해 배포까지, 위에서부터 순서대로 진행하는 문서다.
- **[직접]** 표시 단계는 터미널이나 브라우저에서 직접 한다.
- **[Claude]** 표시 단계는 VS Code의 Claude에게 맡긴다. 요청 문구가 함께 적혀 있다.
- 끝난 단계는 `- [ ]`를 `- [x]`로 바꾼다.

---

## 0. 작업 방법

| 상황 | 방법 |
| --- | --- |
| 이 문서의 단계 진행 | `/step B3` (모든 [Claude] 단계 공통) |
| 이 문서에 없는 요청 | `/refine 칩 선택 UI를 키보드로도 조작하게` |
| 방향이 바뀜 | `/refine`으로 요청 → 이 문서 해당 부분과 5장 변경 기록이 함께 갱신됨 |

- Claude의 규칙은 루트 `CLAUDE.md`에 있다 (한 단계씩, 코드 전 설계 요지 승인, 범위 밖 수정·새 패키지 금지, 보고 형식).
- 위험 명령 차단과 확인 창은 `.claude/settings.json`이 맡는다. 커밋·푸시·패키지 설치는 확인 창이 뜬다.
- `/step`은 **[직접]** 단계를 대신 실행하지 않고 할 일만 안내한다.

---

## 1. 프로젝트 요약

### 무엇을 만드나
시선추적 기반 국어 비문학 학습 앱 **천지문**의 랜딩페이지와 이벤트 신청 기능.
첫 화면에서 서비스가 무엇인지 이해시키고, 이벤트 신청으로 이어지게 한다.

### 타깃과 톤
| 구분 | 내용 |
| --- | --- |
| 주 타깃 | 예비 고3 (2028 수능 응시 예정). 모든 메시지의 기준 |
| 폼에서만 받음 | 예비 고2, N수생 |
| 보조 | 학부모 (FAQ에서 대응) |
| 톤 | 차분하고 신뢰감 있게. "1등급 보장" 같은 과장 금지 |

### 이벤트
| 항목 | 내용 |
| --- | --- |
| ID | `csat-2027-gaze-report` |
| 이름 | 2027 수능 비문학, 35일 다시 읽기 |
| 신청 기간 | 2026-11-20 00:00 KST(포함, 수능 다음 날) ~ 2027-01-05 00:00 KST(미포함) |
| STEP 1 · 신청 즉시 | 올해 수능 비문학 지문 우선 공개 + 응시자 평균 시선 패턴과 비교한 내 시선 리포트 (신규 제안 기능, README에 명시) |
| STEP 2 · 35일 동안 | 2027-01-05 ~ 02-08, 다시 물 주기(3·14·35일 간격 복습)로 틀린 문항 복습, 완주 시 프리미엄 1개월 |

### 페이지 구성 (단일 페이지 `/`)
| 순서 | 섹션 | 내용 |
| --- | --- | --- |
| - | Header | 스크롤 시 고정, CTA 유지 |
| 1 | Hero | "올해 수능 비문학, 당신의 눈은 어디서 멈췄을까." + 지문 위 시선 경로 애니메이션 + CTA `35일 다시 읽기 신청` + 보조 링크 `앱 살펴보기` |
| 2 | Problem | "시간이 부족한 게 아니라, 같은 문장을 다시 읽고 있던 것" + 되돌아감 표시가 있는 짧은 지문 |
| 3 | How | 읽기 → 시선 기록 → 6유형 리포트. 2단계 아래 "영상은 저장하지 않고 시선 좌표만 분석합니다" |
| 4 | Features | 하루 3지문 · 6개 유형 약점 분석 · 다시 물 주기 |
| 5 | Event | STEP 1 → 2 타임라인 + 신청 폼 |
| 6 | FAQ | 카메라로 얼굴을 찍나요? / iOS 지원 / 비용 / 시선추적 정확도 |
| - | Footer | |

### 디자인 원칙
| 요소 | 규칙 |
| --- | --- |
| 컬러 | 오프화이트 배경, 잉크 네이비 본문, 포인트 1색(시선 경로·CTA 전용). 이벤트 섹션만 새싹 그린 보조색 |
| 타이포 | Pretendard 단일, 지문 영역만 명조 계열 |
| 간격 | 4/8 기반 스케일, 섹션 간격 일관 |
| 모션 | Hero 1회 재생, `prefers-reduced-motion`이면 정지. 나머지는 hover·focus 전환만 |
| 비주얼 | 스토어 스크린샷 대신 직접 만든 UI 목업 |
| 접근성 | focus-visible 링, 대비 AA, 폼 오류는 `aria-live` |

### 기술 결정
| 항목 | 결정 |
| --- | --- |
| 런타임 | Node 22 |
| 프레임워크 | Next.js 16 (App Router, `src/` 디렉터리, `@/*` → `./src/*`) |
| 언어·스타일 | TypeScript strict, Tailwind CSS 4 |
| 검증 | zod 4 (클라이언트 폼과 서버가 같은 스키마 공유) |
| 테스트 | Vitest 5 |
| 저장소 | DB 없음. 인메모리 저장소 (인터페이스로 분리) |
| 상태관리 | 컴포넌트 지역 상태만. 전역 상태 라이브러리(zustand 등)·서버 상태 캐시는 쓰지 않음 (공유할 상태가 없음) |
| CI | GitHub Actions: lint → typecheck → test → build |
| 배포 | Vercel Git 연동. CI를 Deployment Check로 걸어 통과한 빌드만 프로덕션 반영 |
| 브랜치 | `main` 하나. 작업 브랜치·PR 없이 커밋 후 `main`에 푸시. 푸시 전 `npm run verify`로 로컬 검증 |
| 개발 환경 | Windows + Git Bash. CI·Vercel은 Linux라서 파일명 대소문자를 import와 정확히 맞춘다 |

### 하지 않는 것
DB 연동, 로그인·신청 조회, 관리자 페이지, 확인 이메일 발송, 휴대폰 번호 수집, 연령 확인 필드(대상이 고2 이상), E2E 테스트(시간이 남으면 검토).

---

## 2. API 명세

`POST /api/events/{eventId}/applications`

### 요청
```json
{
  "name": "김천지",
  "email": "student@example.com",
  "grade": "PRE_HIGH3",
  "weakTypes": ["INFERENCE", "APPLICATION"],
  "agreePrivacy": true,
  "agreeMarketing": false,
  "website": ""
}
```

| 필드 | 필수 | 규칙 |
| --- | --- | --- |
| name | O | 앞뒤 공백 제거 후 2–20자 |
| email | O | 공백 제거·소문자 정규화 후 최대 254자, 이메일 형식 |
| grade | O | `PRE_HIGH3` / `PRE_HIGH2` / `N_SU` |
| weakTypes | - | 기본 `[]`. `DETAIL`(세부 내용 일치) `INFERENCE`(추론) `APPLICATION`(사례 적용) `VOCABULARY`(어휘) `STRUCTURE`(전개 방식) `MAIN_IDEA`(핵심 논지) 중 0–3개, 중복 금지 |
| agreePrivacy | O | boolean. `false`면 `CONSENT_REQUIRED` |
| agreeMarketing | - | boolean, 기본 `false` |
| website | - | 허니팟(화면에 숨김). 값이 있으면 저장하지 않고 201 응답 |

정의되지 않은 필드는 무시한다.

### 응답
- 성공: `201 { "id": string, "createdAt": ISO-8601 }`
- 오류: 항상 `{ "error": { "code", "message", "fields"? } }`. `fields`는 필드별 오류가 있을 때만, 필드마다 메시지 하나.

| 상황 | 상태 | code |
| --- | --- | --- |
| JSON 파싱 실패, 본문이 객체 아님 | 400 | `INVALID_BODY` |
| Content-Type이 JSON 아님 | 415 | `UNSUPPORTED_MEDIA_TYPE` |
| 본문 10KB 초과 | 413 | `PAYLOAD_TOO_LARGE` |
| 필드 검증 실패 | 422 | `VALIDATION_ERROR` + `fields` |
| `agreePrivacy`가 `false` | 422 | `CONSENT_REQUIRED` + `fields.agreePrivacy` |
| 없는 이벤트 | 404 | `EVENT_NOT_FOUND` |
| 신청 기간 아님 | 409 | `EVENT_CLOSED` |
| 같은 이벤트·같은 이메일 | 409 | `ALREADY_APPLIED` |
| 같은 IP 분당 5회 초과 | 429 | `RATE_LIMITED` + `Retry-After`(초) |
| 예상치 못한 오류 | 500 | `INTERNAL_ERROR` (서버 로그만, 내부 정보 노출 금지) |

메시지는 한국어로, 폼에 그대로 보여 줄 수 있는 문장으로 쓴다.

### 처리 순서
앞에서 실패하면 뒤는 실행하지 않는다.
1. rate limit (IP: `x-forwarded-for` 첫 주소 → `x-real-ip` → `"unknown"`)
2. 이벤트 조회
3. Content-Type 확인
4. 본문 크기 확인
5. JSON 파싱, 객체 여부 확인
6. 스키마 검증·정규화
7. 허니팟 → 값이 있으면 저장 없이 201
8. 비즈니스 규칙: 신청 기간 → 필수 동의 → 저장(중복이면 실패)
9. 201 응답

### 파일 구조와 책임
```text
src/
├─ app/api/events/[eventId]/applications/route.ts   POST만 export (조립된 핸들러)
└─ lib/
   ├─ events/events.ts             이벤트 상수, 조회, 신청 기간 판정
   ├─ applications/
   │  ├─ schema.ts                 zod 스키마·정규화, 필드 오류 변환. 폼과 공유
   │  ├─ repository.ts             저장소 인터페이스, Application 타입
   │  ├─ memory-repository.ts      인메모리 구현 ((eventId, email) 유일)
   │  ├─ service.ts                기간 → 동의 → 저장
   │  ├─ handler.ts                처리 순서 1~9. 의존성을 주입받는 팩토리
   │  └─ container.ts              실제 의존성 조립 (현재 시각, UUID, 저장소, rate limiter)
   └─ http/
      ├─ errors.ts                 오류 코드 → 상태·메시지, 오류 응답 생성
      └─ rate-limit.ts             고정 윈도우 rate limiter, IP 추출
```
의존 방향: route → container → handler → service → repository. 역방향 import 금지.

### 설계 원칙
- **현재 시각·ID·저장소는 주입받는다.** 테스트가 실행 날짜와 무관해야 한다. `new Date()`·`crypto.randomUUID()` 직접 호출은 `container.ts`와 허니팟 응답에서만.
- **중복 확인과 저장은 한 번의 `save`로.** 조회와 저장을 나누지 않는다 (DB unique 제약과 같은 의미).
- **도메인 실패는 결과 타입으로 반환.** 예외는 예상치 못한 오류에만.
- **스키마는 형태·범위만**, 동의·기간·중복은 service가 판단.
- **오류 응답은 `errors.ts` 한 곳을 거친다.**
- 이벤트 조회 시 `toString`, `__proto__` 같은 객체 기본 속성이 이벤트로 잡히지 않게 한다.
- 개발 서버 HMR에서 저장소가 초기화되지 않도록 런타임 저장소는 `globalThis`에 둔다.

### 알려진 제약
인메모리 저장소와 rate limit은 서버리스 인스턴스끼리 공유되지 않는다. 중복 방지·요청 제한은 같은 인스턴스 안에서만 보장된다. README에 한 줄로 적는다.

---

## 3. 진행 순서

### Phase A. 프로젝트 준비 (11/26–27)

- [x] **A1. 환경 확인 [직접]**
  ```bash
  node -v      # v22.x
  git --version
  gh --version # 없어도 됨 (A4에서 웹으로 대체)
  ```

- [x] **A2. 프로젝트 생성 [직접]**
  `visualcamp_landing` 폴더가 이미 있으면(가드레일 파일 등) 다른 곳으로 옮겨 둔다. create-next-app은 비어 있지 않은 폴더에 만들지 않는다.
  ```bash
  cd /d/Project
  npx create-next-app@16 visualcamp_landing \
    --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm
  cd visualcamp_landing
  code .
  ```
  확인: `src/app/`이 있고, `tsconfig.json`의 `paths`가 `"@/*": ["./src/*"]`, `npm run dev`로 기본 페이지가 열림

- [x] **A3. 의존성과 스크립트 [직접]**
  ```bash
  npm i -E zod@4
  npm i -D -E vitest@5 @types/node@22
  npm pkg set scripts.lint="eslint ."
  npm pkg set scripts.typecheck="next typegen && tsc --noEmit"
  npm pkg set scripts.test="vitest run"
  npm pkg set engines.node=">=22"
  npm pkg set scripts.clean="node -e \"for (const p of ['.next','next-env.d.ts','tsconfig.tsbuildinfo']) require('fs').rmSync(p,{recursive:true,force:true})\""
  npm pkg set scripts.verify="npm run clean && npm run lint && npm run typecheck && npm run test && npm run build"
  ```
  - `@types/node`를 22로 맞추는 이유: create-next-app 기본값(20)이 vitest가 요구하는 범위와 맞지 않아 설치가 실패한다.
  - `typecheck`에 `next typegen`을 붙이는 이유: `next-env.d.ts`와 라우트 타입은 gitignore 대상이라 CI에는 없다. 먼저 생성해야 CI에서도 통과한다.
  - `clean`·`verify`: CI처럼 생성 파일이 없는 상태에서 전체 검사를 돌린다. Claude는 `rm -rf`가 막혀 있어서 이 스크립트로 정리한다.
  - `-E`: `^` 없이 설치된 정확한 버전으로 고정한다.
  - `--legacy-peer-deps`나 `--force`는 쓰지 않는다.

  확인: `npx vitest --version`, `npm run typecheck`

- [x] **A4. GitHub 저장소 [직접]**
  ```bash
  # 가드레일 파일 복사: CLAUDE.md, .claude/, .gitattributes → 루트 / GUIDE.md → docs/GUIDE.md
  # CLAUDE.md가 이미 있으면 덮어쓴다 (가드레일 CLAUDE.md가 @AGENTS.md를 불러온다)
  echo ".claude/settings.local.json" >> .gitignore
  git add --renormalize .
  git branch -M main
  git add .
  git commit -m "chore: init next.js project"
  gh repo create visualcamp_landing --private --source=. --push
  ```
  `gh`가 없으면 GitHub 웹에서 빈 저장소를 만들고 `git remote add origin <URL>` → `git push -u origin main`.

- [x] **A5. Vercel 연결 [직접]**
  1. vercel.com → Add New → Project → `visualcamp_landing` Import → Deploy
  2. 목록에 없으면 Adjust GitHub App Permissions에서 저장소 접근 허용
  3. Settings → Git → Production Branch가 `main`인지 확인

  확인: 배포 URL에서 기본 페이지가 열림

### Phase B. 이벤트 신청 API (11/28–30)

각 단계의 기준은 2장이다.

- [x] **B1. Vitest 설정 [Claude]**
  - 요청: `/step B1`
  - 수정 대상: `vitest.config.mts`
  - 내용: `@` 별칭 → `./src` (플러그인 없이 `resolve.alias`), 환경 `node`, 대상 `tests/**/*.test.ts`. 확장자는 `.mts` (프로젝트가 CommonJS로 취급되어 `.ts`면 ESM 경고가 난다)
  - 완료 기준: `npx vitest run` → "No test files found" (테스트가 아직 없으므로 정상. 이때 종료 코드 1도 정상이며, B8 전까지 `npm run test` 실패는 무시한다)

- [x] **B2. 이벤트 정의 [Claude]**
  - 수정 대상: `src/lib/events/events.ts`
  - 내용: 1장 이벤트 하나를 상수로 정의. `findEvent(eventId)`, `isEventOpen(event, now)`. 시각은 `+09:00` 고정 (Vercel 서버는 UTC)
  - 완료 기준: `npm run typecheck`

- [x] **B3. 입력 스키마 [Claude]**
  - 수정 대상: `src/lib/applications/schema.ts`
  - 내용: 2장 요청 표대로. 학년·유형은 상수 배열로 export(폼 재사용). 이메일은 정규화 후 형식 검사(`" A@b.com "` 통과). 필드 오류를 `{ 필드: 첫 메시지 }`로 바꾸는 함수 포함
  - 완료 기준: `npm run typecheck`

- [x] **B4. 저장소 [Claude]**
  - 수정 대상: `src/lib/applications/repository.ts`, `memory-repository.ts`
  - 내용: `save(application)` → 성공 또는 `DUPLICATE`, `count(eventId)`. `Application`은 입력에서 `website`를 뺀 것 + `id`, `eventId`, `createdAt`
  - 완료 기준: `npm run typecheck`

- [x] **B5. 서비스 [Claude]**
  - 수정 대상: `src/lib/applications/service.ts`
  - 내용: `repository`, `now`, `generateId`를 주입받아 `apply(event, input)`. 기간 → 동의 → 저장. 결과는 성공 또는 `EVENT_CLOSED` / `CONSENT_REQUIRED` / `ALREADY_APPLIED`
  - 완료 기준: `npm run typecheck`

- [x] **B6. 오류 응답 + rate limit [Claude]**
  - 수정 대상: `src/lib/http/errors.ts`, `rate-limit.ts`
  - 내용: 2장 오류 표를 한 곳에 정의하고 응답 생성 함수(헤더 전달 가능). rate limiter는 고정 윈도우, 키별 카운트, 윈도우가 지나면 초기화, 남은 시간을 올림한 초 반환. 테스트를 위해 시계를 주입할 수 있게
  - 완료 기준: `npm run typecheck`

- [x] **B7. 핸들러 + 라우트 [Claude]**
  - 수정 대상: `src/lib/applications/handler.ts`, `container.ts`, `src/app/api/events/[eventId]/applications/route.ts`
  - 내용: 2장 처리 순서 그대로. 전체 try/catch → `INTERNAL_ERROR`. `container.ts`에서 분당 5회 rate limiter와 `globalThis` 저장소로 조립. route는 `POST`만 export
  - 완료 기준: `npm run typecheck`, 그리고 `npm run dev` 후
    ```bash
    curl -i -X POST http://localhost:3000/api/events/csat-2027-gaze-report/applications \
      -H "Content-Type: application/json" \
      -d '{"name":"김천지","email":"a@example.com","grade":"PRE_HIGH3","agreePrivacy":true}'
    ```
    신청 기간 안(2026-11-20 ~ 2027-01-04)이면 `201`, 같은 이메일로 다시 보내면 `409 ALREADY_APPLIED`

- [x] **B8. 테스트 [Claude]**
  - 수정 대상: `tests/api/applications.test.ts`, `tests/lib/rate-limit.test.ts`
  - 방식: 서버를 띄우지 않고 핸들러 팩토리에 테스트용 의존성을 넣어 `Request`를 직접 전달. 테스트마다 새 저장소, 고정 시각 **2026-12-10 12:00 KST**, 순차 ID. 상태·`error.code`·`fields` 키·저장 건수를 확인
  - **반드시 포함할 케이스** (테스트 이름은 한국어)

    | 분류 | 케이스 | 기대 |
    | --- | --- | --- |
    | 성공 | 유효한 신청 | 201, 주입한 id·createdAt, 저장 1건 |
    | 성공 | 선택 필드 없이 신청 | 201 |
    | 형식 | 깨진 JSON | 400 `INVALID_BODY` |
    | 형식 | JSON 배열 본문 | 400 `INVALID_BODY` |
    | 형식 | Content-Type `text/plain` | 415 |
    | 형식 | 본문 10KB 초과 | 413 |
    | 검증 | name 1자 / 21자 | 422 `fields.name` |
    | 검증 | 이메일 형식 오류 | 422 `fields.email` |
    | 검증 | 없는 grade | 422 `fields.grade` |
    | 검증 | weakTypes 중복 / 4개 / 없는 값 | 422 `fields.weakTypes` |
    | 검증 | agreePrivacy가 boolean 아님 | 422 `fields.agreePrivacy` |
    | 검증 | 위 실패 케이스 모두 | 저장 0건 |
    | 검증 | name·email·grade 동시 오류 | `fields` 키가 정확히 3개 |
    | 검증 | 공백·대문자 이메일 신청 후 정규화된 같은 이메일 재신청 | 409 |
    | 규칙 | agreePrivacy `false` | 422 `CONSENT_REQUIRED`, `fields.agreePrivacy` |
    | 규칙 | 같은 이메일 재신청 | 409 `ALREADY_APPLIED`, 저장 1건 유지 |
    | 규칙 | 없는 eventId | 404 |
    | 규칙 | 시작 1초 전 / 마감 시각 정각 | 409 `EVENT_CLOSED` |
    | 규칙 | 시작 시각 정각 | 201 |
    | 남용 | 허니팟에 값 | 201, 저장 0건 |
    | 남용 | 한도 2로 설정, 같은 IP 3번째 | 429, `Retry-After: 60` |
    | rate-limit | 윈도우 경과 후 | 다시 허용 |
    | rate-limit | 다른 키 | 각각 허용 |
    | rate-limit | `x-forwarded-for: 203.0.113.1, 10.0.0.1` | `203.0.113.1` |

  - 완료 기준: `npm run test` 전부 통과, 위 표와 대조한 목록 보고

- [x] **B9. CI 워크플로 [Claude]**
  - 수정 대상: `.github/workflows/ci.yml`
  - 내용: `main` push에서 실행, 같은 ref 이전 실행 취소, job 이름 **`ci`**, Ubuntu·Node 22·npm 캐시·10분 제한, `npm ci` → lint → typecheck → test → build. 액션 메이저 버전은 공식 저장소에서 확인
  - 완료 기준: 파일 생성

- [x] **B10. CI 조건으로 전체 검증 [Claude]**
  ```bash
  npm run verify
  ```
  완료 기준: 모두 통과, build 라우트 목록에 `ƒ /api/events/[eventId]/applications`

- [x] **B11. 푸시와 배포 게이트 [직접]**
  1. 커밋 → `main` 푸시 → Actions `ci` 통과, 프로덕션 배포 확인
  2. Vercel → Settings → Build and Deployment → Deployment Checks → Add Checks → `ci`

### Phase C. 디자인 기반 (12/1)

- [x] **C1. 디자인 토큰 [Claude]**
  - 요청: `/step C1` (설계 요지에서 팔레트와 타입 스케일 후보 2개를 보여 준다)
  - 수정 대상: `src/app/globals.css`
  - 내용: 1장 디자인 원칙을 Tailwind 4 `@theme` 토큰으로. 배경·본문·보조 텍스트·경계선·포인트·이벤트 보조색, 타입 스케일(모바일/데스크톱), 간격, 반경. 이후 컴포넌트는 임의 hex 대신 토큰만 쓴다
  - 완료 기준: 고른 후보로 적용, 대비 AA 확인 결과 보고

- [ ] **C2. 폰트 [Claude]**
  - 수정 대상: `src/app/layout.tsx`, `globals.css`
  - 내용: Pretendard(본문), 지문용 명조 1종. 기본으로 들어 있는 Geist 폰트는 제거. 로딩 방식(`next/font/local` 등)을 먼저 제안
  - 완료 기준: 개발 서버에서 폰트 적용 확인, `npm run build` 통과

- [ ] **C3. 레이아웃과 공통 UI [Claude]**
  - 수정 대상: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/ui/*`
  - 내용: `lang="ko"`, 메타데이터 기본값, 기본 페이지 내용 제거. `Container`, `SectionHeading`, `Button`(primary·secondary, hover·focus-visible·disabled)
  - 완료 기준: 빈 섹션 자리만 있는 페이지, `npm run lint`

### Phase D. 섹션 (12/2–4)

각 섹션은 `src/components/sections/`에 하나씩 만들고 `page.tsx`에 배치한다.
카피는 Claude가 1장 톤에 맞춰 **2안을 먼저 제안**하고, 고른 안으로 구현한다.

- [ ] **D1. Header [Claude]** — 고정, 로고 텍스트 + CTA(이벤트 섹션으로 스크롤), 스크롤 시 배경·경계선 전환
- [ ] **D2. Hero + 시선 경로 [Claude]** — 데스크톱 2열(카피 / 지문 목업), 모바일 세로. `src/components/gaze/GazePath.tsx`: 지문 위에 멈춘 지점(점)과 되돌아간 경로(곡선)를 SVG로 1회 그림. reduced-motion이면 완성 상태로 표시. 보조 링크는 Play 스토어 앱 페이지
- [ ] **D3. Problem [Claude]** — 문제 제기 카피 + 되돌아감 표시가 있는 짧은 지문 예시
- [ ] **D4. How [Claude]** — 3단계(데스크톱 3열 / 모바일 세로), 2단계 아래 카메라 안내 한 줄
- [ ] **D5. Features [Claude]** — 카드 3개, 다시 물 주기는 3·14·35일 간격을 시각적으로
- [ ] **D6. FAQ [Claude]** — 아코디언 4개, 키보드로 열고 닫기 가능 (`details`/`summary` 같은 내장 요소 우선)
- [ ] **D7. Footer [Claude]** — 서비스명, 앱 링크, 문의처

각 단계 완료 기준: 375px·768px·1280px 폭에서 확인, `npm run lint`, `npm run typecheck`
섹션 2~3개마다 `npm run verify` 후 커밋·푸시한다.

### Phase E. 이벤트 섹션과 신청 폼 (12/5–6)

- [ ] **E1. Event 섹션 [Claude]** — 이벤트 이름·신청 기간, STEP 1 → 2 타임라인(이벤트 보조색 허용)
- [ ] **E2. 신청 폼 [Claude]**
  - 수정 대상: `src/components/form/*`, Event 섹션
  - 내용:
    - 폼 로직(입력값·검증·제출·응답 처리·상태 전환)은 `useApplicationForm` 훅으로 분리하고, 컴포넌트는 그리기만 한다
    - B3 스키마를 그대로 써서 클라이언트 검증 (제출 시 전체, 이후 필드 변경 시 해당 필드)
    - 서버 응답의 `fields`를 필드별로 표시, 상단 요약은 `aria-live`
    - `CONSENT_REQUIRED`, `ALREADY_APPLIED`, `EVENT_CLOSED`, `RATE_LIMITED`, 네트워크 오류마다 안내 문구
    - 제출 중 버튼 비활성·중복 제출 방지, 성공 시 폼 자리에 완료 상태
    - weakTypes는 칩 선택(최대 3개, 초과 시 안내), 허니팟 필드는 화면과 보조기기 모두에서 숨김
    - 신청 기간 밖이면 폼 대신 안내 (기간 판정은 서버 응답 기준, 화면에는 기간 표시)
  - 완료 기준: 각 오류 케이스를 실제로 발생시켜 표시 확인, 키보드만으로 작성·제출 가능, `npm run lint`·`typecheck`·`test`
  - 참고: 신청 기간 밖 안내 화면은 실제 시각으로는 볼 수 없으므로, 서버가 `EVENT_CLOSED`를 돌려주는 경우를 개발 중에 임시로 만들어 확인한다 (확인 후 원복).

### Phase F. 마감 (12/7–8)

- [ ] **F1. 반응형·접근성 점검 [Claude + 직접]** — 375·768·1280px, 실제 휴대폰(프로덕션 URL), 키보드 탐색 순서, focus 표시, 대비, reduced-motion. 발견한 문제는 목록으로 받고 하나씩 수정
- [ ] **F2. 메타데이터 [Claude]** — title, description, Open Graph, favicon
- [ ] **F3. README [Claude]** — 아래 목차로 초안 → 직접 다듬기
  1. 프로젝트 소개, 배포 URL
  2. 의도: 타깃(왜 예비 고3이고 왜 지금인가), 톤, 주요 결정과 이유 (하나의 이벤트에 두 단계, 시선 경로 비주얼, 개인정보 최소 수집, DB 미사용)
  3. API 설계: 엔드포인트, 오류 형식, 처리 순서, 인메모리 제약 한 줄
  4. CI/CD: 검사 항목과 이유, Deployment Checks로 배포 게이트
  5. 실행 방법: 설치, 개발 서버, 테스트, 빌드
  6. 참고: 리포트의 평균 시선 패턴 비교는 신규 제안 기능, AI 도구 사용 범위
- [ ] **F4. 최종 확인 [직접]** — `npm run verify`로 검증 → 푸시 → 프로덕션 URL에서 전체 흐름 확인 → 저장소 공개 범위 확인

---

## 4. 막혔을 때

| 증상 | 확인 |
| --- | --- |
| 로컬은 되는데 Vercel·CI 빌드만 실패 | import 경로와 실제 파일명 대소문자 |
| CI typecheck만 실패 | `typecheck` 스크립트에 `next typegen`이 있는지 |
| 테스트에서 `@/...` 모듈을 못 찾음 | `vitest.config.mts`의 별칭이 `./src`인지 |
| 신청하면 항상 409 | 같은 이메일이면 `ALREADY_APPLIED` (개발 서버를 재시작하면 인메모리 저장소가 비워짐). 2027-01-05 이후면 `EVENT_CLOSED` |
| main에 푸시했는데 프로덕션에 안 나감 | Actions `ci` 실패 여부 (Deployment Checks가 막는 중), Production Branch 설정 |

---

## 5. 변경 기록

방향이 바뀌거나 새로 확정한 결정을 한 줄씩 남긴다. 형식: `- 날짜 | 결정 | 이유`

- 2026-11-26 | 가이드 작성 | -
- 2026-11-26 | create-next-app `@16`·의존성 `-E` 고정, `/step` [직접] 판정을 브랜치 확인보다 먼저, Phase E 이후 브랜치 명시, CLAUDE.md에 `@AGENTS.md` | 버전 일치, Phase A에서 `/step` 오작동 방지, 문서 빈칸 해소
- 2026-11-26 | 브랜치 없이 `main` 하나로 작업 (PR·Preview 없음) | 사용자 결정, 1인 작업
- 2026-11-26 | 신청 시작을 2026-12-01에서 2026-11-20 00:00 KST(수능 다음 날)로 | 수능 직후 시의성, 개발·심사 시점부터 신청 가능
- 2026-11-27 | 상태관리는 지역 상태만, 전역 라이브러리 미사용. 폼 로직은 `useApplicationForm` 훅으로 분리 | 페이지 안에 공유할 상태가 없음, 폼 로직과 화면을 나눠 읽고 설명하기 쉽게
- 2026-11-27 | CI 워크플로(B9)를 테스트(B8)와 같은 커밋 묶음으로 먼저 추가, 액션은 `actions/checkout@v7`·`actions/setup-node@v7` | 테스트가 생기기 전에 CI를 켜면 test 단계가 항상 실패하므로 함께 푸시해 첫 실행부터 통과
