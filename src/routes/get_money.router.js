import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 게임 머니 벌기 API
router.post('/getmoney/:character_name', authMiddleware, async (req, res) => {
  try {
    const { character_name } = req.params;
    const userId = req.user.userId;

    // 캐릭터 조회 및 소유 확인
    const character = await prisma.characters.findUnique({
      where: { character_name }
    });

    if (!character) return res.status(404).json({ message: 'Character not found' });
    if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

    // 게임 머니 100원 추가
    const updated = await prisma.characters.update({
      where: { characterId: character.characterId },
      data: {
        money: { increment: 100 }
      }
    });

    return res.status(200).json({ message: 'Money earned', money: updated.money });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
