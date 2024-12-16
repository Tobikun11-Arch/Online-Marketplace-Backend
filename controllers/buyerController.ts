import { Request, Response } from 'express';
import MainShop from "../models/MainShop";
import Product from '../models/product';
import TrendingProduct from '../models/TrendingProduct';
import User from '../models/user';
import { Types } from 'mongoose'

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
        const product = await Product.findById(productId);
        const mainproduct = await MainShop.findById(productId);
        const trendingproduct = await TrendingProduct.findById(productId);

        // Ensure productID is valid
        const productID = product?._id || mainproduct?._id || trendingproduct?._id;

        if (!productID) {
            return res.status(404).json({ error: 'Product not found in any collection' });
        }

        const price =
            product?.productPrice ||
            mainproduct?.productPrice ||
            trendingproduct?.productPrice;

        if (!price) {
            return res.status(400).json({ error: 'Product price not available' });
        }

        const cartItem = {
            productId: productID as Types.ObjectId,
            productName,
            images,
            quantity,
            price: parseFloat(price),
            addedAt: new Date(),
        };

        const user = await User('buyer').findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingItemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === productID.toString()
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
            results[category] = productCategory
        }

        res.status(200).json({
            message: "category get successful",
            categories: results
        })
    } catch (error) {
        console.error("Error fetching categories: ", error)
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
        }

        else{
            res.status(404).json({ message: "user not found" })
        }
    } 
    catch (error) {
        console.error("Failed to update: ", error)
    }
}