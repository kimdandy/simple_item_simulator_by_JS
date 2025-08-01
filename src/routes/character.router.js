import express from 'express';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 캐릭터 생성
router.post('/character/new', authMiddleware, async(req, res, next) =>{
    const { userId } = req.user; // 인증된 사용자 정보에서 userId 추출
    const { character_name } = req.body;

    // 캐릭터 중복 확인
    const isExistCharacter = await prisma.characters.findFirst({ 
        where: {
            character_name,
        }
    });
    if(isExistCharacter){  // 중복 존재시
        return res.status(409).json({message: 'Already Exist Character!'});
    }

    const character = await prisma.characters.create({
        data: {
            userId: userId , // 인증된 사용자 정보에서 가져옴
            character_name,
            health: 500,
            power: 100,
            money: 10000
        }
    });

    return res.status(201).json({
        data: character
    });

});

//////////////////////////////////////////////////////////////////////////////

// 캐릭터 삭제
router.delete('/character/delete/:characteId', authMiddleware, async(req, res, next) =>{
    const { characterId } = req.params;
    const { password } = req.body;

    const character = await prisma.characters.findUnique({
        where: { characterId: characterId}
    });

   if(!character) { // 캐릭터가 존재하지 않을 경우
        return res.status(404).json({ message: 'Character Not Found!' });
    }
    else if (character.password !== password) { // 입력한 비밀번호가 틀렸을 경우
        return res.status(401).json({message: "Wrong Password!"});
    }

    await prisma.characters.delete({ where: { characterId: characterId } });

    return res.status(200).json({ data: "Character Deleted!" });
});

//////////////////////////////////////////////////////////////////////////////
// 캐릭터 정보 조회 ; 테스트용
router.get('/character', authMiddleware, async(req, res, next) => {
    const { userId } = req.user;
    const characters = await prisma.characters.findMany({
        select: {
            //characterId: true,
            userId: true,
            character_name: true,
            health: true,
            power: true,
            money: true
        }
    });

    return res.status(200).json({ data : characters});
});

//////////////////////////////////////////////////////////////////////////////
// 캐릭터 세부 정보 조회
router.get('/character/:characterId', authMiddleware, async(req, res, next) => {
    if(1){
        const character = await prisma.characters.findUnique({
            where: { characterId: req.params.characterId },
            select: {
                characterId: true,
                character_name: true,
                health: true,
                power: true,
                money: true
            }
        });
    }

    return res.status(200).json({ data : character});
});
export default router;