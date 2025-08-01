import express from 'express';
import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';

//import LogMiddleware from './middlewares/log.middleware.js';

import AccountRouter from './routes/account.router.js';
import CharacterRouter from './routes/character.router.js';
import ItemRouter from './routes/items.router.js';
//import ProductRouter from './routes/product.router.js';

const app = express();
const PORT = 3000; // 서버 포트 설정

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(cookieParser());
//app.use(LogMiddleware); // 로그 미들웨어 사용

app.use('/api', [AccountRouter, CharacterRouter, ItemRouter]); // router 

app.listen(PORT, () => { // 연결 확인 메시지
  console.log(PORT, 'Port connected!');
});