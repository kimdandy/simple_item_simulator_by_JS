import express from 'express';
import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';

import AccountRouter from './routes/account.router.js';
import GameRouter from './routes/game.router.js';

const app = express();
const PORT = 3000;

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(cookieParser());

app.use('/api', [AccountRouter, GameRouter]); // router 

app.listen(PORT, () => { // 연결 확인 메시지
  console.log(PORT, 'Port connected!');
});