import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
  try {

    const { authorization } = req.cookies;
    if (!authorization) throw new Error('NO Token');

    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer')
      throw new Error('Token Type NOT Matched');

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //'custom-secret-key');
    const userId = decodedToken.userId;
    // console.log('userNo:', userNo); // 확인용

    const user = await prisma.accounts.findUnique({
      where: { userId: decodedToken.userId }, // 토큰에 암호화하여 저장된 userId를 복호화하여 추출
    });
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('NO USER Exist');
    }

    // req.user에 사용자 정보를 저장
    req.user = user;

    next();

  } catch (error) {
    res.clearCookie('authorization');

    // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: 'Token is Expired' });
      case 'JsonWebTokenError':
        return res.status(401).json({ message: 'Token is Manipulated' });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? 'Abnoraml Request' });
    }
  }
}