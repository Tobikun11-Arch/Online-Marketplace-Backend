import { Request, Response } from 'express';
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

export const Update_Product = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            productId,
            productName,
            productDescription,
            productCategory,
            status,
            Sku,
            productPrice,
            productStock,
            productDiscount,
            productQuality,
            productSize,
            images
        } = req.body

        const update_userProduct = await User('seller').findOneAndUpdate(
        {
            _id: userId,
            'sellerProducts._id': productId
        }, {
            $set: {
                'sellerProducts.$': {
                    productName,
                    productDescription,
                    productCategory,
                    status,
                    Sku,
                    productPrice,
                    productStock,
                    productDiscount,
                    productQuality,
                    productSize,
                    images,
                    _id: productId 
                }
            }
        }, {
            new: true
        })

        if(!update_userProduct) {
            return res.status(404).json({ message: "User or Product not found" })
        }
        return res.status(200).json({ message: "Update successfull" })
    } catch (error) {
        console.error("Error: ", error)
    }
}

export const Update_DraftProduct = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            productId,
            productName,
            productDescription,
            productCategory,
            status,
            Sku,
            productPrice,
            productStock,
            productDiscount,
            productQuality,
            productSize,
            images
        } = req.body

        const update_userDraftProduct = await User('seller').findOneAndUpdate(
        {
            _id: userId,
            'draftProducts.$': productId
        }, {
            $set: {
                'draftProducts.$': {
                    productName,
                    productDescription,
                    productCategory,
                    status,
                    Sku,
                    productPrice,
                    productStock,
                    productDiscount,
                    productQuality,
                    productSize,
                    images,
                    _id: productId 
                }
            }
        }, {
            new: true
        })

        if(!update_userDraftProduct) {
            return res.status(404).json({ message: "User or Product not found" })
        }
        return res.status(200).json({ message: "Update successfull" })
    } catch (error) {
        console.error("Error: ", error)
    }
}