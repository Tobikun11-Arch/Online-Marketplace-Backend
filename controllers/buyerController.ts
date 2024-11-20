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

export const ProductId = async(req: Request, res: Response) => {
    const productId = req.params.id
    try {
        const product = await Product.findById(productId)
        const mainproduct = await MainShop.findById(productId)

        if (product || mainproduct) {
            return res.json({ product: product || null, mainproduct: mainproduct || null });
        } 

        else {
            console.log("No product")
            return res.json({ error: 'no product found!' })
        }
    } catch (error) {
        console.error(error)
    }
}

