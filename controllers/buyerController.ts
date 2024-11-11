import { Request, Response } from 'express';
import MainShop from "../models/MainShop";
import Product from '../models/product';

export const ProductList = async (req: Request, res: Response) => {
    try {
        const MainShopProducts = await MainShop.find({})
        const SellerProducts = await Product.find({})
        return res.json({ MainShopProducts, SellerProducts })
    } catch (error) {
        console.error(error)
        return res.json({ error })
    }
}