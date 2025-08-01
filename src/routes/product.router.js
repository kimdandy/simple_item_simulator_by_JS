import express from 'express';

import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 아이템 생성
router.post('/products/create', async (req, res, next) => {
    const { product_name, product_stat, product_price }= req.body; 
    
    const isExistProduct = await prisma.products.findUnique({
        where : { product_name: product_name }
    });
    if(isExistProduct) {
        return res.status(409).json({
            messate: 'Item is already exists!'
        });
    }

    const item = await prisma.products.create({
        data : {
            product_name: product_name,
            product_stat: product_stat,
            product_price: product_price
        }
    });

    return res.status(201).json({ data: item});
    
});

export default router;