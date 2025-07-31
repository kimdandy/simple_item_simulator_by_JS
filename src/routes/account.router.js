import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma/index.js';


const router = express.Router();

// 계정 생성 api
 router.post('/account/sign_up', async(req, res, next) => {
    const { userId, password, confirm_password, name} = req.body;

    const isExistUser = await prisma.accounts.findFirst({
        where: {
            userId,
        }
    });
    if (isExistUser){
        return res.status(409).json({message : 'Already Exist!'})
    }
    
    
    if (confirm_password !== password) {
        return res.status(409).json({message: 'Password is NOT Matched !'})
    }

    // 사용자의 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.accounts.create({
        data: {
            userId,
            password: hashedPassword, //bycrypt 모듈을 사용하여 비밀번호를 암호화 후 저장
            //name, 
        },
    });

    
    //return res.status(201).json({ data : new_account}) // 계정정보 공개 - 비밀번호 암호화로 비공개 처리
    return res.status(201).json({ 
        //message: 'You got new Account!', // 계정 생성 성공 메시지
        data: {
            userId,
            name,
        }
    });  
     
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// 로그인 api
router.post('/account/sign_in', async (req, res, next) => {
    const { userId , password } = req.body;
    const user = await prisma.accounts.findFirst({
        where: { userId }
    });

    if (!user) 
        return res.status(401).json({ message: 'No Data'});
    else if ( !(await bcrypt.compare(password, user.password)) )
        return res.status(401).json({message:'Wrong Password'});

    
    //const ACCESS_TOKEN_SECRET_KEY = 'COME2GAME'; // Access Token Secret Key
    
    // userNo 를 샤용한 Access Token 생성
    const token = jwt.sign(
        {
            userId: user.userId
        },
        'custom-secret-key',
        //ACCESS_TOKEN_SECRET_KEY, 
        //{   expiresIn: '1h'    } // Access Token 유효기간 설정 ; 10초
    );

    // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장
    res.cookie('authorization', `Bearer ${token}`); // ``
    return res.status(200).json({ message: '로그인 성공', token: token});
}); 

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// 계정 조회 - 확인용 
router.get('/sign', async (req, res, next) => {
  const allaccounts = await prisma.accounts.findMany({ // 모든 데이터
    //where: { userNo: +userNo},
    select: {
      userId: true,
    },
  });

  return res.status(200).json({ data: allaccounts });
});

export default router;
