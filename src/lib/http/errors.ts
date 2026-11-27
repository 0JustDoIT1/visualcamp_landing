import type { FieldErrors } from "@/lib/applications/schema";

export type ErrorCode =
  | "INVALID_BODY"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "VALIDATION_ERROR"
  | "CONSENT_REQUIRED"
  | "EVENT_NOT_FOUND"
  | "EVENT_CLOSED"
  | "ALREADY_APPLIED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

/** 오류 코드별 HTTP 상태와 사용자에게 보여 줄 문구. 문구는 이 표에서만 관리한다. */
const ERRORS: Record<ErrorCode, { status: number; message: string }> = {
  INVALID_BODY: { status: 400, message: "요청을 처리할 수 없습니다." },
  UNSUPPORTED_MEDIA_TYPE: { status: 415, message: "지원하지 않는 요청 형식입니다." },
  PAYLOAD_TOO_LARGE: { status: 413, message: "요청 내용이 너무 깁니다." },
  VALIDATION_ERROR: { status: 422, message: "입력값을 확인해 주세요." },
  CONSENT_REQUIRED: { status: 422, message: "개인정보 수집·이용에 동의해 주세요." },
  EVENT_NOT_FOUND: { status: 404, message: "존재하지 않는 이벤트입니다." },
  // 신청 기간은 폼이 이벤트 정의(events.ts)에서 읽어 함께 보여 준다.
  EVENT_CLOSED: { status: 409, message: "지금은 신청 기간이 아닙니다." },
  ALREADY_APPLIED: { status: 409, message: "이미 신청한 이메일입니다." },
  RATE_LIMITED: { status: 429, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
  INTERNAL_ERROR: { status: 500, message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
};

export type ErrorBody = {
  error: { code: ErrorCode; message: string; fields?: FieldErrors };
};

/** 모든 API 오류 응답은 이 함수를 거친다. 형식: { error: { code, message, fields? } } */
export function errorResponse(
  code: ErrorCode,
  options: { fields?: FieldErrors; headers?: HeadersInit } = {},
): Response {
  const { status, message } = ERRORS[code];
  const body: ErrorBody = {
    error: { code, message, ...(options.fields && { fields: options.fields }) },
  };
  return Response.json(body, { status, headers: options.headers });
}
