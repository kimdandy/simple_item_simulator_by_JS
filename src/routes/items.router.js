import express from 'express';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 아이템 생성
router.post('/items/create', async (req, res) => {
    try{
        const { item_code, item_name, item_stat, item_price } = req.body;
        const isExistItem = await prisma.items.findUnique({
            where:{ item_name }
        });
        if(isExistItem) {
            return res.status(409).json({message: 'Item already exists!'});
        }

        const item = await prisma.items.create({
            data: {
                item_code,
                item_name,
                item_stat, 
                item_price
            }
        });

        return res.status(201).json( { data: item});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

/////////////////////////////////////////////////////////////////////////
// 아이템 수정
router.put('/items/:item_code', async (req, res, next) => {
    try{
        const { item_code } = req.params;
        const {item_name, item_stat} = req.body;

        const item = await prisma.items.findUnique({
            where: { item_code : Number(item_code) }
        });
        if(!item) { return res.status(404).json({message:'NO Data'});}

        const revised_item = await prisma.items.update({
            where: { item_code: Number(item_code) },
            data: {
                item_name,
                item_stat
            }    
        });

        return res.status(200).json({ data: revised_item, messate: 'Item updated successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

/////////////////////////////////////////////////////////////////////////
// 아이템 전체 조회
router.get('/items', async (req, res, next) => {
    try{
        const items = await prisma.items.findMany({
            select: {
                item_code :true,
                item_name :true,
                item_price:true
            }
        });

        return res.status(200).json({data: items});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

/////////////////////////////////////////////////////////////////////////
// 아이템 세부 조회
router.get('/items/:item_code', async (req, res, next) => {
    try{
        const { item_code } = req.params;
        const item = await prisma.items.findUnique({
            where: { item_code: Number(item_code) },
            select: {
                item_code : true,
                item_name: true,
                item_stat: true,
                item_price: true
            }
        });

        res.status(200).json({data : item});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

/////////////////////////////////////////////////////////////////////////
// 아이템 구매 
router.post('/items/:character_name/buy', authMiddleware, async (req, res) => {
  try {
    const { character_name } = req.params;
    const { item_code, quantity } = req.body;
    const userId = req.user.userId;

    if (!item_code || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid item_code or quantity' });
    }

    // 캐릭터 조회 및 소유 확인
    const character = await prisma.characters.findUnique({
      where: { character_name }
    });
    if (!character) return res.status(404).json({ message: 'Character Not Found' });
    if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

    // 아이템 조회
    const item = await prisma.items.findUnique({
      where: { item_code }
    });
    if (!item) return res.status(404).json({ message: 'Item Not Found' });

    const totalPrice = item.item_price * quantity;
    if (character.money < totalPrice) return res.status(400).json({ message: 'Insufficient money' });

    // 인벤토리에 해당 아이템 확인
    const inventory = await prisma.inventory.findFirst({
      where: {
        characterId: character.characterId,
        itemId: item_code
      }
    });

    if (inventory) {
      // 기존 아이템 수량 증가
      await prisma.inventory.update({
        where: { inven_id: inventory.inven_id },
        data: { item_count: inventory.item_count + quantity }
      });
    } else {
      // 새 인벤토리 아이템 추가
      await prisma.inventory.create({
        data: {
          characterId: character.characterId,
          itemId: item_code,
          item_count: quantity
        }
      });
    }

    // 캐릭터 머니 차감
    await prisma.characters.update({
      where: { characterId: character.characterId },
      data: { money: character.money - totalPrice }
    });

    return res.status(200).json({ message: 'Item purchased', money: character.money - totalPrice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


/////////////////////////////////////////////////////////////////////////
// 아이템 판매 
router.post('/items/:character_name/sell', authMiddleware, async (req, res) => {
  try {
    const { character_name } = req.params;
    const { item_code, quantity } = req.body;
    const userId = req.user.userId;

    if (!item_code || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid item_code or quantity' });
    }

    // 캐릭터 조회 및 소유 확인
    const character = await prisma.characters.findUnique({
      where: { character_name }
    });
    if (!character) return res.status(404).json({ message: 'Character Not Found' });
    if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

    // 인벤토리에서 아이템 조회 (판매 가능한 아이템은 인벤토리에 있어야 하며, 장착된 아이템은 판매 불가)
    const inventory = await prisma.inventory.findFirst({
      where: {
        characterId: character.characterId,
        itemId: item_code
      }
    });
    if (!inventory || inventory.item_count < quantity) {
      return res.status(400).json({ message: 'Not enough items in inventory to sell' });
    }

    // 장착 여부 확인 (장착되어 있으면 판매 불가)
    const equipped = await prisma.equipments.findUnique({
      where: {
        characterId_itemId: {
          characterId: character.characterId,
          itemId: item_code
        }
      }
    });
    if (equipped) {
      return res.status(400).json({ message: 'Cannot sell equipped item' });
    }

    // 아이템 정보 조회
    const item = await prisma.items.findUnique({
      where: { item_code }
    });
    if (!item) return res.status(404).json({ message: 'Item Not Found' });

    const sellPrice = Math.floor(item.item_price * 0.6) * quantity;

    // 인벤토리 아이템 수량 차감 또는 삭제
    if (inventory.item_count === quantity) {
      await prisma.inventory.delete({
        where: { inven_id: inventory.inven_id }
      });
    } else {
      await prisma.inventory.update({
        where: { inven_id: inventory.inven_id },
        data: { item_count: inventory.item_count - quantity }
      });
    }

    // 캐릭터 머니 증가
    await prisma.characters.update({
      where: { characterId: character.characterId },
      data: { money: character.money + sellPrice }
    });

    return res.status(200).json({ message: 'Item sold', money: character.money + sellPrice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/////////////////////////////////////////////////////////////////////////


export default router;