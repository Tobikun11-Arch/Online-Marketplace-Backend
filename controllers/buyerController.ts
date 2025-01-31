import { Request, Response } from 'express';
import User from '../models/user';
import { Types } from 'mongoose'

export const ProductList = async (req: Request, res: Response) => {
    try {
        //most sold products in one go
        const order_products = await User('seller').find({}).select('product_orders')
        const trend_products = order_products.flatMap(seller => seller.product_orders.flatMap(trends => trends.product.filter(product => product.quantity > 3))).slice(0, 3)

        //Newest upload for my home page
        const product = await User('seller').find({}).select('sellerProducts')
        const seller_products = product.flatMap(seller => seller.sellerProducts) //all products in all seller
        const sorted_products = seller_products.sort((a, b)=> b.createdAt.getTime() - a.createdAt.getTime()).slice(0,3)

        //Sorted data for most sold products that over 20 quantity and pass 20 data only
        const popular_products = order_products.flatMap(seller => seller.product_orders.flatMap(trends => trends.product.filter(product => product.quantity >= 20))).slice(0, 20)

        console.log("popular_products: ", popular_products)

        return res.json({ MainShopProducts: sorted_products, TrendingProducts: trend_products, seller_products, popular_products })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const CartProducts = async (req: Request, res: Response) => {
    const { Email } = req.body;
    if(!Email) {
        return res.status(400).json({ error: 'userId is required' })
    }

    try {
        const user = await User('buyer').findOne({ Email: Email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found in any collection' });
        }
        return res.status(200).json({ user })

    } catch (error) {
        console.error('error finding user ', error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const updateQuantity = async (req: Request, res: Response) => {  //Update quantity
    const { userId, productId, quantity } = req.body;
    if(!userId || !productId) {
        return res.status(400).json({ error: 'UserId, ProductId are required' });
    }

    console.log({userId, productId, quantity})

    try {
        const user = await User('buyer').findById(userId);
        if(!user) {
            return res.status(400).json({ error: 'user not found' })
        }   

        const existingItemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === productId.toString()
        );

        if (existingItemIndex > -1) {
            user.cart[existingItemIndex].quantity = quantity
        }

        await user.save()
        res.status(200).json({ message: 'successful updating product!' })
    } catch (error) {
        console.error("Error updating quantity: ", error)
        res.status(500).json({ erorr: "error updating quantity" })
    }
}

export const deleteProduct = async (req: Request, res: Response) => { //Delete product
    const { productId, userId } = req.body

    if(!productId) {
        return res.status(400).json({ error: 'product Id not found' })
    }

    try {
        const user = await User('buyer').findById(userId);
        if(!user) {
            return res.status(400).json({ error: 'user not found' })
        }   

        const productExists = user.cart.some((item)=> item.productId.toString() === productId)
        if(!productExists) {
            return res.status(404).json({ error: 'product not found in user cart' })
        }

        await User('buyer').updateOne(
            { _id: userId },
            { $pull: {cart: { productId } } }
        )

        return res.status(200).json({ message: 'Product successfully removed from cart' })
    } catch (error) {
        console.error(error)
    }
}

export const Cart = async (req: Request, res: Response) => { //Add to cart
    const { userId, productName, images, productId, quantity} = req.body;

    if (!userId || !productName || !images || !productId || !quantity) {
        return res.status(400).json({ error: 'UserId, ProductId, and Quantity are required' });
    }

    try {
        //New structure
        const seller_product = await User('seller').find({}).select('sellerProducts')
        const filtered_product = seller_product.flatMap(seller => seller.sellerProducts)
        const cart_products = filtered_product.find(product => product._id.toString() === productId)

        if(!cart_products) {
            return res.status(404).json({ error: 'Product not found' })
        }

        const cartItem = {
            productId: cart_products?._id as Types.ObjectId,
            productName,
            images,
            quantity,
            price: cart_products.productPrice,
            addedAt: new Date(),
        };

        const user = await User('buyer').findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingItemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === cart_products?._id.toString()
        );

        if (existingItemIndex > -1) {
            user.cart[existingItemIndex].quantity += quantity; //if ung product is already nasa cart magiging +1 nalang
        } else {
            user.cart.push(cartItem); //if its not ipupush sa cart
        }

        await user.save() //save the product
        return res.status(200).json({ message: 'Product added to cart', cart: user.cart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const ProductId = async(req: Request, res: Response) => {
    const productId = req.params.id
    try {
        const products = await User('seller').find({}).select('sellerProducts')
        const allProducts = products.flatMap(seller => seller.sellerProducts);
        const specificProduct = allProducts.find(product => product._id.toString() === productId);

        if(!specificProduct) {
            return res.status(404).json({ message: "No product found" })
        }
        const similar_products = allProducts.filter(product => product.productCategory == specificProduct.productCategory)
        const sorted_products = allProducts.sort((a, b)=> b.createdAt.getTime() - a.createdAt.getTime()).slice(0,3)

        return res.status(200).json({ similar: similar_products || [], product: specificProduct || [], mainproduct: sorted_products })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error getting specific data and similar products" })
    }
}

export const CategoryLength = async(req: Request, res: Response) => {
    try {
        const categories = ['Fashion', 'Electronics', 'Home & Kitchen', 'Automotive']

        //New structure
        const newResults: Record<string, any[]> = {}

       //Implementing new code blocks
       for (const category of categories) {
            const newCategory = await User('seller').find({}).select('sellerProducts')
            const product_length = newCategory.flatMap(seller_category => seller_category.sellerProducts)
            const found_category = product_length.filter(product => product.productCategory == category)
            newResults[category] = found_category ? found_category : []
        }

        return res.status(200).json({
            message: "category get successful",
            categories: newResults
        })
    } catch (error) {
        return res.status(500).json({
            message: 'an error occured while fetching'
        })
    }
}

export const UpdateProfile = async(req: Request, res: Response) => {
    const { userId, FirstName, LastName, PhoneNumber, PetName, Email, Username } = req.body;

    try {
        const modifiedData = await User('buyer').updateOne(
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
            res.status(200).json({ message: "Update successfully" })
        } else{
            res.status(404).json({ message: "user not found" })
        }
    } 
    catch (error) {
        console.error("Failed to update: ", error)
    }
}