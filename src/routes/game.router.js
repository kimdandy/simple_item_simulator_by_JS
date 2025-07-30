import express from 'express';

import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 캐릭터 생성
router.post('/new_character', async(req, res, next) =>{
    const {character_name } = req.body;
    const isExistCharacter = await prisma.characters.findFirst({
        where: {
            character_name,
        }
    });

});

// 캐릭터 삭제

export default router;