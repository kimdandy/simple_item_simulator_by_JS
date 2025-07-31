import express from 'express';

import { prisma } from '../utils/prisma/index.js';
//import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 이이템 생성
router.post('/item/new', async (req, res, next) => {
    const { item_name, health, power, item_price } = req.body;

    const isExistItem = await prisma.items.findUnique({
        where: {
            item_name
        }
    });
    if(isExistItem){
        return res.status(409).json({message: 'Already Exist Item!'});
    }

    // const item_stat = await prisma.item_stat.create({
    //     data: {
    //         health,
    //         power
    //     }
    // });
    const item_stat = { health, power}
    //const item_stat = JSON.stringify(item_stat_json);

    // const item = await prisma.items.create({
    //     data: {
    //         //item_code,
    //         item_name,
    //         item_stat ,
    //         item_price
    //     }
    // });

    const item = await prisma.items.create({
    data: {
        item_name: "Steel Sword",
        item_stat: 12311586,
        // {
        //     attack: 15,
        //     durability: 100
        // },
        item_price: 1200
    }
});


    return res.status(201).json({
        data: item
    });
});

//////////////////////////////////////////////////////////////////////////////
// 아이템 수정
router.put('/item/update/:item_code', async (req, res, next) => {
    const { item_code } = req.params;
    const { item_name, item_stat } = req.body;

    const itemtoChange = await prisma.items.findUnique({
        where: {
            item_code
        }
    })
    if(!itemtoChange){
        return res.status(409).json({message: 'Item is Not Exist!'});
    }

    await prisma.items.update({
        data: { item_name, item_stat },
        where: { item_code }
    });
    
    return res.status(200).json({ data: 'Item Updated!' });
});

//////////////////////////////////////////////////////////////////////////////
// 이이템 목록 조회
router.get('/item', async (req, res, next) => {
    const items = await prisma.items.findMany({
        select : {
            item_code:true,
            item_name:true,
            // item_stat:true,
            item_price:true
        }
    });

    return res.status(200).json({
        data : items
    });
});

//////////////////////////////////////////////////////////////////////////////
// 아이템 상세 조회
router.get('/item/:item_code', async (req, res, next) => {
    const { item_code } = req.params;
    const item = await prisma.items.findUnique({
        where: {
            item_code
        },
        select : {
            item_code:true,
            item_name:true,
            item_stat:true,
            item_price:true
        }
    });

    return res.status(200).json({
        data : item
    });
});


export default router;