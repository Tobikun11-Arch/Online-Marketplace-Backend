import { Request, Response } from 'express';
import Product from "../models/product";

export const SellerProductlist = async (req: Request, res: Response) => {
    try {
        const product = await Product.find({})
        return res.json({ product })
    } catch (error) {
        console.error(error)
        return res.json({ error })
    }
}