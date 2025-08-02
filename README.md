# JS Item Simulator API

Node.js와 Express, Prisma ORM, JWT 인증을 사용한 간단한 게임 아이템 시뮬레이터 API 프로젝트입니다.
유저 계정 생성, 로그인, 캐릭터 관리, 아이템 구매/판매, 장비 관리, 게임 머니 적립 기능 등을 포함합니다.

---

## 주요 기능

### 1. 계정 관리

* **회원가입**: 유저 ID, 비밀번호, 이름으로 계정 생성 (비밀번호 bcrypt 암호화)
* **로그인**: JWT 토큰 발급 (Access Token)
* **JWT 인증 미들웨어**로 보호된 API 접근 가능

### 2. 캐릭터 관리

* **캐릭터 생성**: 캐릭터 이름, 초기 스탯(health:500, power:100), 초기 게임 머니 10,000 지급
* **캐릭터 삭제**: 소유주 본인만 비밀번호 인증 후 삭제 가능
* **캐릭터 상세 조회**: 캐릭터 기본 정보 + 본인 캐릭터일 경우 게임 머니 포함 반환

### 3. 아이템 관리

* **아이템 생성/수정/조회**: 아이템 코드, 이름, 스탯, 가격 정보 관리
* **아이템 구매**: 캐릭터 소유 게임 머니 내에서만 구매 가능, 인벤토리에 추가됨
* **아이템 판매**: 인벤토리 내 아이템만 판매 가능, 장착 중인 아이템은 판매 불가, 60% 가격으로 판매 후 머니 증가

### 4. 인벤토리 & 장비 관리

* **인벤토리 조회**: 캐릭터가 가진 아이템 및 개수 조회
* **장비 장착/해제**: 동일 아이템은 한 개만 장착 가능, 장착 상태 관리

### 5. 게임 머니 적립

* **게임 머니 벌기 API**: 캐릭터 ID로 100원씩 머니 적립 (로그인 필요)

---

## 기술 스택

* Node.js
* Express.js
* Prisma ORM (PostgreSQL 또는 MySQL 등 연동 가능)
* bcrypt (비밀번호 암호화)
* jsonwebtoken (JWT 인증)
* cookie-parser (쿠키 사용)

---

## 설치 및 실행

```bash
git clone <repository-url>
cd <project-folder>
npm install

# .env 파일 생성 (예시)
ACCESS_TOKEN_SECRET=your_jwt_secret_key

# DB 설정 및 Prisma 마이그레이션
npx prisma migrate dev --name init

npm start
```

---

## API 엔드포인트 요약

| 메서드    | 경로                            | 설명               | 인증 필요 여부 |
| ------ | ----------------------------- | ---------------- | -------- |
| POST   | /account/sign\_up             | 회원가입             | No       |
| POST   | /account/sign\_in             | 로그인 (JWT 토큰 발급)  | No       |
| POST   | /character/create             | 캐릭터 생성           | Yes      |
| DELETE | /character/\:character\_name  | 캐릭터 삭제 (비밀번호 인증) | Yes      |
| GET    | /character/\:character\_name  | 캐릭터 상세 조회        | Yes      |
| POST   | /items/create                 | 아이템 생성           | No       |
| PUT    | /items/\:item\_code           | 아이템 수정           | No       |
| GET    | /items                        | 전체 아이템 조회        | No       |
| GET    | /items/\:item\_code           | 아이템 상세 조회        | No       |
| POST   | /items/buy/\:character\_name  | 아이템 구매           | Yes      |
| POST   | /items/sell/\:character\_name | 아이템 판매           | Yes      |
| GET    | /inventory/\:character\_name  | 인벤토리 조회          | Yes      |
| POST   | /equip/\:character\_name      | 아이템 장착           | Yes      |
| DELETE | /equip/\:character\_name      | 아이템 해제           | Yes      |
| POST   | /money/earn/\:character\_name | 게임 머니 적립         | Yes      |

---

## 참고 사항

* JWT 토큰은 로그인 시 발급되며, `authorization` 쿠키에 `Bearer <token>` 형태로 저장됩니다.
* 모든 인증 API는 `authMiddleware` 미들웨어를 통해 토큰 검증을 수행합니다.
* `character_name`은 고유하며 캐릭터를 식별하는 키로 사용됩니다.
* 인벤토리, 장비, 아이템은 Prisma 모델 관계에 기반해 구현되어 있습니다.

