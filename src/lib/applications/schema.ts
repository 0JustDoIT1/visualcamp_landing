import { z } from "zod";

/**
 * 이벤트 신청 입력 스키마. 서버(handler)와 클라이언트 폼이 같은 파일을 쓴다.
 * 형태·값 범위만 검증한다. 동의 여부·신청 기간·중복은 service가 판단한다.
 */

export const GRADES = ["PRE_HIGH3", "PRE_HIGH2", "N_SU"] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_LABELS: Record<Grade, string> = {
  PRE_HIGH3: "예비 고3",
  PRE_HIGH2: "예비 고2",
  N_SU: "N수생",
};

export const WEAK_TYPES = [
  "DETAIL",
  "INFERENCE",
  "APPLICATION",
  "VOCABULARY",
  "STRUCTURE",
  "MAIN_IDEA",
] as const;
export type WeakType = (typeof WEAK_TYPES)[number];

export const WEAK_TYPE_LABELS: Record<WeakType, string> = {
  DETAIL: "세부 내용 일치",
  INFERENCE: "추론",
  APPLICATION: "사례 적용",
  VOCABULARY: "어휘",
  STRUCTURE: "전개 방식",
  MAIN_IDEA: "핵심 논지",
};

export const MAX_WEAK_TYPES = 3;

export const applicationSchema = z.object({
  name: z
    .string({ error: "이름을 입력해 주세요." })
    .trim()
    .min(2, { error: "이름은 2자 이상 입력해 주세요." })
    .max(20, { error: "이름은 20자 이하로 입력해 주세요." }),
  // 공백 제거·소문자 변환을 먼저 하고 형식을 검사한다. (" A@b.com " 통과)
  email: z
    .string({ error: "이메일을 입력해 주세요." })
    .trim()
    .toLowerCase()
    .max(254, { error: "이메일이 너무 깁니다." })
    .pipe(z.email({ error: "올바른 이메일 형식이 아닙니다." })),
  grade: z.enum(GRADES, { error: "학년을 선택해 주세요." }),
  weakTypes: z
    .array(z.enum(WEAK_TYPES, { error: "알 수 없는 유형입니다." }), {
      error: "약한 유형 값이 올바르지 않습니다.",
    })
    .max(MAX_WEAK_TYPES, { error: `약한 유형은 최대 ${MAX_WEAK_TYPES}개까지 선택할 수 있습니다.` })
    .refine((types) => new Set(types).size === types.length, {
      error: "같은 유형을 중복해서 선택할 수 없습니다.",
    })
    .default([]),
  agreePrivacy: z.boolean({ error: "개인정보 수집·이용 동의 여부를 선택해 주세요." }),
  agreeMarketing: z.boolean({ error: "마케팅 수신 동의 값이 올바르지 않습니다." }).default(false),
  /** 허니팟: 화면에서 숨긴 필드. 값이 있으면 봇으로 본다. */
  website: z.string({ error: "올바르지 않은 값입니다." }).default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export type FieldErrors = Record<string, string>;

/** zod 오류를 { 필드명: 첫 번째 메시지 }로 바꾼다. 경로가 없는 오류는 "_root"에 담는다. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";
    fields[key] ??= issue.message;
  }
  return fields;
}
