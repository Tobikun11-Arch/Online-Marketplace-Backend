import { Request, Response } from 'express';
import MainShop from "../models/MainShop";

export const SellerProductlist = async (req: Request, res: Response) => {
    try {
        const product = await MainShop.find({})
        return res.json({ product })
    } catch (error) {
        console.error(error)
        return res.json({ error })
    }
}