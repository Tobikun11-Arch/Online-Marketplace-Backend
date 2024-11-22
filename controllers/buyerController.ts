import { Request, Response } from 'express';
import MainShop from "../models/MainShop";
import Product from '../models/product';
import TrendingProduct from '../models/TrendingProduct';

export const ProductList = async (req: Request, res: Response) => {
    try {
        const MainShopProducts = await MainShop.find({})
        const SellerProducts = await Product.find({})
        const TrendingProducts = await TrendingProduct.find({})
        return res.json({ MainShopProducts, SellerProducts, TrendingProducts })
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
        const trendingproduct = await TrendingProduct.findById(productId)
        let similar: any = []

        if(product?.productCategory || mainproduct?.productCategory || trendingproduct?.productCategory) {
            const category = product?.productCategory || mainproduct?.productCategory || trendingproduct?.productCategory
            const similarproducts = await Product.find({ 
                productCategory: category,
                _id: { $ne: productId }
            })

            const similarmainshop = await MainShop.find({ 
                productCategory: category,
                _id: { $ne: productId }
            })

            const trendingproducts = await TrendingProduct.find({ 
                productCategory: category,
                _id: { $ne: productId }
            })

            similar = [...similarproducts, ...similarmainshop, ...trendingproducts]
        }

        if (product || mainproduct || trendingproduct) {
            return res.json({ product: product || null, trendingproduct: trendingproduct || null, mainproduct: mainproduct || null, similar: similar || [] });
        } else {
            console.log("No product")
            return res.json({ error: 'no product found!' })
        }
    } catch (error) {
        console.error(error)
    }
}

export const CategoryLength = async(req: Request, res: Response) => {
    try {
        const categories = ['Fashion', 'Electronics', 'Home & Kitchen', 'Automotive']
        const results: Record<string, any[]> = {}

        for (const category of categories) {
            const productCategory = await Product.find({ productCategory: category })
            const mainshopCategory = await MainShop.find({ productCategory: category })
            results[category] = [...productCategory, ...mainshopCategory]
        }

        res.status(200).json({
            message: "category get successful",
            categories: results
        })
    } catch (error) {
        console.error("Error fetching categories: ", error)
        res.status(500).json({
            message: 'an error occured while fetching'
        })
    }
}