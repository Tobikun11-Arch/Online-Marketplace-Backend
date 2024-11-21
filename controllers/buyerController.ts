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
        let similar: any = []

        if(product?.productCategory || mainproduct?.productCategory) {
            const category = product?.productCategory || mainproduct?.productCategory
            const similarproducts = await Product.find({ 
                productCategory: category,
                _id: { $ne: productId }
            })

            const similarmainshop = await MainShop.find({ 
                productCategory: category,
                _id: { $ne: productId }
            })

            similar = [...similarproducts, ...similarmainshop]
        }

        if (product || mainproduct) {
            return res.json({ product: product || null, mainproduct: mainproduct || null, similar: similar || [] });
        } 

        else {
            console.log("No product")
            return res.json({ error: 'no product found!' })
        }
    } catch (error) {
        console.error(error)
    }
}

