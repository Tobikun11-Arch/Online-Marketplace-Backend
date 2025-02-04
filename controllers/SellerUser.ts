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

            //since in my seller, the product was in nested array, I had to use flatMap to get all the products
            const allProducts = user.product_orders?.flatMap(order => order.product)

            //reduce to iterate the flat nested product [] and get the total quantity of each product
            const productQuantities = allProducts.reduce((acc, product) => {
                if (!acc[product.productId.toString()]) {
                  acc[product.productId.toString()] = 0;    
                }
                acc[product.productId.toString()] += product.quantity;
                return acc; 
            }, {} as Record<string, number>);
              
              //Convert the result to the desired format (optional)
            const result = Object.entries(productQuantities).map(([productId, quantity]) => ({
                productId,
                totalQuantity: quantity,
            }));

            const products = [...user.sellerProducts, ...user.draftProducts]
            return res.status(200).json({ user_data: products, productQuantities: result })
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

export const orders_page = async (req: Request, res: Response) => {
    const { userId } = req.query 

    try {
        const user = await User('seller').findById(userId)

        if(!user) {
            return res.status(404).json({ message: "User not found!" })
        }

        const orders_product = await User('seller').findOne(
            {_id: userId},
            { product_orders: 1 }
        )

        const order_products = orders_product?.product_orders.flatMap(product=> product.product)

        const customer_info = orders_product?.product_orders.map(buyer => ({
            buyer_firstName: buyer.buyer_firstName,
            buyer_lastName: buyer.buyer_lastName,
            buyer_email: buyer.buyer_email,
            buyer_username: buyer.buyer_username,
        }));
        
        // Count occurrences of each email
        const purchaseCountMap = new Map();
        
        orders_product?.product_orders.forEach(buyer => {
            purchaseCountMap.set(buyer.buyer_email, (purchaseCountMap.get(buyer.buyer_email) || 0) + 1);
        });
        
        // Filter unique customers and add total purchases
        const customer_list = customer_info?.filter((word, index, self) =>
            index === self.findIndex(w => word.buyer_email === w.buyer_email)
        ).map(buyer => ({
            ...buyer,
            total_purchases: purchaseCountMap.get(buyer.buyer_email) || 0
        }));

        return res.status(200).json({ product_orders: order_products, buyer_info: customer_list })

    } catch (error) {
        console.error("Error ", error)
        return res.status(500).json({ message: "Internal server error" })
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

export const SellerData = async (req: Request, res: Response) => {
    /**Products : sellerproducts count
    Ordered: products count on product orders
    Buyer: Buyer counts  */

    try {
    const { userId } = req.query
        
        const user = await User('seller').findById(userId)
        if(!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const buyer_info = user.product_orders.map((buyer)=> ({
            email: buyer.buyer_email
        }))

        const products_count = user.sellerProducts.length //products count
        const order_count = user.product_orders.length //orders count
        const buyer_count = buyer_info?.filter((word, index, self) => //buyers count
            index === self.findIndex(w => word.email === w.email)
        ).length

        const data = {
            productcount: products_count,
            ordercount: order_count,
            buyercount: buyer_count
        }
        
        return res.status(200).json({ seller_data: [data] })
    } catch (error) {
        console.error("Error requesting data: ", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

export const UpdateSeller = async(req: Request, res: Response) => {
    const { userId, FirstName, LastName, PhoneNumber, PetName, Email, Username } = req.body;

    try {
        const modifiedData = await User('seller').updateOne(
            { _id: userId },
            {
                $set: {
                    FirstName: FirstName,
                    LastName: LastName,
                    PhoneNumber: PhoneNumber,
                    PetName: PetName,
                    Email: Email,
                    Username: Username,
                    updatedAt: new Date()
                }
            }
        )
        if(modifiedData.modifiedCount > 0) {
            return res.status(200).json({ message: "Update successfully" })
        } else{
            return res.status(404).json({ message: "user not found" })
        }
    } 
    catch (error) {
        console.error("Failed to update: ", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}