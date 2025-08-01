import express from 'express';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 아이템 생성
router.post('/items/create', async (req, res) => {
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
});

/////////////////////////////////////////////////////////////////////////
// 아이템 수정
router.put('/items/:item_code', async (req, res, next) => {
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
});

/////////////////////////////////////////////////////////////////////////
// 아이템 전체 조회
router.get('/items', async (req, res, next) => {
    const items = await prisma.items.findMany({
        select: {
            item_code :true,
            item_name :true,
            item_price:true
        }
    });

    return res.status(200).json({data: items});
});

/////////////////////////////////////////////////////////////////////////
// 아이템 세부 조회
router.get('/items/:item_code', async (req, res, next) => {
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
});

/////////////////////////////////////////////////////////////////////////

export default router;