import { postApplication } from "@/lib/applications/container";

// 라우트 파일은 Next.js가 허용하는 export만 둔다. 핸들러 팩토리는 handler.ts에 있다.
export const POST = postApplication;
