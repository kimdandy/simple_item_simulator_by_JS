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

        const character = await prisma.characters.findUnique({
        where:{ character_name }
        });
        if(!character) {
            return res.status(404).json({ message: 'Character Not Found!' });
        }

        const character_stat = {
            name: character.character_name,
            health: character.health,
            power: character.power
        } 
        if(character.userId === userId){
            character_stat.money = character.money;
        };

        return res.status(200).json({ data : character_stat });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//////////////////////////////////////////
// 캐릭터 인벤토리 조회
router.get('/character/:character_name/inventory', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { character_name } = req.params;

  const character = await prisma.characters.findUnique({
    where: { character_name },
    include: {
      inventory: {
        include: {
          item: true
        }
      }
    }
  });

  if (!character) return res.status(404).json({ message: 'Character not found' });
  if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

  const inventoryItems = character.inventory.map(inv => ({
    item_code: inv.item.item_code,
    item_name: inv.item.item_name,
    item_stat: inv.item.item_stat,
    item_price: inv.item.item_price
  }));

  return res.status(200).json({ character_name: character_name, inventory: inventoryItems });
});

////////////////////////////////////////////////////////////////////////////////////
// 장비 장착 
router.post('/character/:character_name/equip', authMiddleware, async (req, res) => {
  try {
    const { character_name } = req.params;
    const { item_code } = req.body;
    const userId = req.user.userId;

    // 캐릭터 조회
    const character = await prisma.characters.findUnique({
      where: { character_name }
    });
    if (!character) return res.status(404).json({ message: 'Character Not Found' });

    // 캐릭터 소유 확인
    if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

    // 아이템 조회
    const item = await prisma.items.findUnique({
      where: { item_code }
    });
    if (!item) return res.status(404).json({ message: 'Item Not Found' });

    // 중복 장착 확인 (복합 유니크 키로 조회)
    const existingEquip = await prisma.equipments.findUnique({
      where: {
        characterId_itemId: {
          characterId: character.characterId,
          itemId: item_code
        }
      }
    });
    if (existingEquip) return res.status(400).json({ message: 'Item already equipped' });

    // 장착 생성
    const equip = await prisma.equipments.create({
      data: {
        characterId: character.characterId,
        itemId: item_code
      }
    });

    return res.status(201).json({ message: 'Item equipped', data: equip });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

////////////////////////////////////////////////////////////////////////////////////
// 장착 아이템 조회
router.get('/character/:character_name/equip', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { character_name } = req.params;

  const character = await prisma.characters.findUnique({
    where: { character_name }
  });
  if (!character) { // 캐릭터가 존재하지 않을 경우
    return res.status(404).json({ message: 'Character not found' });
    }
  if (character.userId !== userId) { // 캐릭터가 사용자 소유가 아닐 경우
    return res.status(403).json({ message: 'Not your character' });}

  const equipment = await prisma.equipments.findFirst({
    where: { characterId: character.id },
    include: {
      item: true
    }
  });
  if (!equipment) { // 장착된 아이템이 없을 경우
    return res.status(200).json({ message: 'No item equipped' });
  }

  const item = equipment.item;

  return res.status(200).json({
    equipped: {
      item_code: item.item_code,
      item_name: item.item_name,
      item_stat: item.item_stat
    }
  });
});


//////////////////////////////////////////////////////////////////////////////
// 장비 해제 
router.delete('/character/:character_name/equip/:item_code', authMiddleware, async (req, res) => {
  try {
    const { character_name, item_code } = req.params;
    const userId = req.user.userId;

    // 캐릭터 조회 및 소유 확인
    const character = await prisma.characters.findUnique({
      where: { character_name }
    });
    if (!character) return res.status(404).json({ message: 'Character Not Found' });
    if (character.userId !== userId) return res.status(403).json({ message: 'Not your character' });

    // 장착 중인지 확인 및 삭제 (복합키 기준)
    const equip = await prisma.equipments.findUnique({
      where: {
        characterId_itemId: {
          characterId: character.characterId,
          itemId: Number(item_code)
        }
      }
    });
    if (!equip) return res.status(404).json({ message: 'Equipment not found' });

    await prisma.equipments.delete({
      where: {
        equip_id: equip.equip_id
      }
    });

    return res.status(200).json({ message: 'Equipment removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//////////////////////////////////////////////////////////////////////////////

export default router;