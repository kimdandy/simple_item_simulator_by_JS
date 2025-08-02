import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 캐릭터 생성
router.post('/character', authMiddleware, async(req, res, next) =>{
    try{
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
        else if (!character_name) { // 캐릭터 이를을 입력하지 않았을 경우
            return res.status(400).json({ message: 'Character name is required!' });
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
            message: 'Character Created Successfully!',
            data: character
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

});

//////////////////////////////////////////////////////////////////////////////

// 캐릭터 삭제
router.delete('/character/:character_name', authMiddleware, async(req, res, next) =>{
    try{
        const { userId } = req.user;
        const { character_name } = req.params;
        const { password } = req.body;

        const user = await prisma.accounts.findFirst({
            where: { userId }
        });
        const delCharacter = await prisma.characters.findFirst({
            where: { character_name }
        });


        if(!delCharacter) { // 캐릭터가 존재하지 않을 경우
            return res.status(404).json({ message: 'Character Not Found!' });
        }
        else if (delCharacter.userId !== userId) { // 캐릭터가 사용자 소유가 아닐 경우
            return res.status(403).json({ message: 'Not your chatacter'})
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!password){ // 비밀번호를 입력하지 않았을 경우
            return res.status(400).json({ message: 'Password is required!' });
        }
        else if (!isPasswordMatched) { // 입력한 비밀번호가 틀렸을 경우
            return res.status(401).json({message: "Wrong Password!"});
        }  

        await prisma.characters.delete({ 
            where: { character_name: character_name } 
        });

        return res.status(200).json({ data: "Character Deleted!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

});

//////////////////////////////////////////////////////////////////////////////
// 캐릭터 정보 조회 ; 테스트용
router.get('/character', async(req, res, next) => {
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
router.get('/character/:character_name', authMiddleware, async(req, res, next) => {
    try{
        const { userId } = req.user;
        const { character_name } = req.params;

        const findCharacter = await prisma.characters.findUnique({
        where:{ character_name }
        });
        if(!findCharacter) {
            return res.status(404).json({ message: 'Character Not Found!' });
        }

        const findCharacter_stat = {
            name: findCharacter.character_name,
            health: findCharacter.health,
            power: findCharacter.power
        } 
        if(findCharacter.userId === userId){
            findCharacter_stat.money = findCharacter.money;
        };

        return res.status(200).json({ data : findCharacter_stat });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////

export default router;