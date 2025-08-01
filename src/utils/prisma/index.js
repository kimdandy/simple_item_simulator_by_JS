import { PrismaClient } from "../../../generated/prisma/index.js"; // PrismaClient를 가져옵니다.
// default 경로 보다는 output  경로를 따로 지정하는 것을 권장
// import { PrismaClient } from '@prisma/client'; // 일반적인 경우 이 경로를 사용합니다.

// prisma를 import 하는 방법 자체가 migration한 경로를 인식하지 못함
// prisma.generate

export const prisma = new PrismaClient({
  // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력
  log: ['query', 'info', 'warn', 'error'],

  // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력
  errorFormat: 'pretty',
}); // PrismaClient 인스턴스를 생성