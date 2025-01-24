import { Request, Response } from 'express';
import User from '../models/user';

export const Get_Product = async (req: Request, res: Response) => {
    const { userId, productId } = req.query
    try {
        if(!productId) {
            const user = await User('seller').findById(userId)
            if(!user) { 
                return res.status(404).json({ message: "user not found"}) 
            }
            const products = [...user.sellerProducts, ...user.draftProducts]
            return res.status(200).json({ user_data: products })
        } else {
            const user = await User('seller').findOne(
                { _id: userId },
                {   
                    draftProducts: { $elemMatch: { _id:  productId } },
                    sellerProducts: { $elemMatch: { _id:  productId } }
                }
            )

            if(!user) { 
                return res.status(404).json({ message: "user not found"}) 
            }
            
            const matchedProduct = user.sellerProducts?.[0] || user.draftProducts?.[0];
            return res.status(200).json({ user_data: matchedProduct })
        }
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
            'draftProducts._id': productId
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

export const Draft_Publish = async (req: Request, res: Response) => {
    try {
        const {
            productId,
            userId,
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
        } = req.body
        if(!userId) { return res.status(404).json({ message: "userId not found" }) }

        const sellerProducts = {
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
        }

        const updateResult = await User('seller').updateOne(
            { _id: userId },
            { $addToSet: { sellerProducts: sellerProducts } }
        )
        if(updateResult.modifiedCount > 0) {
            const deleteResult = await User('seller').updateOne(
                { _id: userId },
                { $pull: { draftProducts: { _id: productId } } }
            )
            if(deleteResult.modifiedCount > 0) {
                return res.status(200).json({ message: "Successfully added and removed from draft" })
            } else {
                return res.status(400).json({ message: "failed to upload and delete the product" })
            }
        } else{
            return res.status(400).json({ messsage: "Failed to add the product" })
        }
    } catch(error) {
        console.error("Error: ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const DeleteProduct = async (req: Request, res: Response) => {
    const { productId, userId } = req.body

    const user = await User('seller').findById(userId)
    if(!user) {
        return res.status(404).json({ message: "user not found" })
    }

    try {
        const delete_product = await User('seller').updateOne(
            { _id: userId },
            {
                $pull: {
                    draftProducts: { _id: { $in: productId } },
                    sellerProducts: { _id: { $in: productId } }
                }
            }
        )

        if(delete_product.modifiedCount > 0) {
            return res.status(200).json({
                message: "Product(s) successfully removed."
            })
        } 
    
        return res.status(404).json({
            message: "No product(s) found"
        })
    } catch (error) {
        console.error("Error deleting product: ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}