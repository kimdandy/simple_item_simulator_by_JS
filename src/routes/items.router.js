import express from 'express';

import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 아이템 생성
router.post('/items/create', async (req, res) => {
    // const { item_Id } = req.params;
    const {item_name, item_stat, item_price } = req.body;

    const isExistItem = await prisma.items.findUnique({
        where:{ item_name }
    });
    if(isExistItem) {
        return res.status(409).json({message: 'Item already exists!'});
    }

    const item = await prisma.items.create({
        data: {
            item_name,
            item_stat,
            item_price
        }
    });

    return res.status(201).json( { data: item});
});

/////////////////////////////////////////////////////////////////////////
// 아이템 수정
router.put('/items/:item_Id', async (req, res, next) => {
    const { item_Id } = req.params;
    const {item_name, item_stat} = req.body;

    const item = await prisma.items.findUnique({
        where: { item_Id }
    });
    if(!item) { return res.status(404).json({message:'NO Data'});}

    await prisma.items.update({
        where: { item_Id: item_Id },
        data: {
            item_name,
            item_stat
        }    
    });

    return res.status(200).json({ data: item, messate: 'Item updated successfully!' });
});

/////////////////////////////////////////////////////////////////////////
// 아이템 전체 조회
router.get('/items', async (req, res, next) => {
    const items = await prisma.items.findMany({
        select: {
            item_Id,
            item_name,
            item_price
        }
    });

    return res.status(200).json({data: items});
});

/////////////////////////////////////////////////////////////////////////
// 아이템 세부 조회
router.get('/items/:item_Id', async (req, res, next) => {
    const { item_Id } = req.params;
    const item = await prisma.items.findUnique({
        where: { item_Id },
        select: {
            item_Id,
            item_name,
            item_stat,
            item_price
        }
    });

    res.status(200).json({data : item});
});

/////////////////////////////////////////////////////////////////////////


export default router;