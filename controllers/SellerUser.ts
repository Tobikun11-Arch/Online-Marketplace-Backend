import { Request, Response } from 'express';
import MainShop from "../models/MainShop";
import Product from '../models/product';
import TrendingProduct from '../models/TrendingProduct';
import User from '../models/user';
import { Types } from 'mongoose'


export const Get_Product = async (req: Request, res: Response) => {
    const { userId } = req.query
    try {
        const user = await User('seller').findById(userId)
        if(!user) { 
            return res.status(404).json({ message: "user not found" }) 
        }
        const products = [...user.sellerProducts, ...user.draftProducts]
        return res.status(200).json({ user_data: products })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}