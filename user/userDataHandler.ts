import { Request, Response } from 'express';
import User from '../models/user';
import Product from '../models/product';
import { Types } from 'mongoose';
import { product_types_stripe } from '../types/stripeProduct';
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET);

export const SearchList = async (req: Request, res: Response) => {
    const { userId, search, deleteItem } = req.body;

    try {
        const user_exist = await User('buyer').findById(userId)
        if(user_exist) {
            if(deleteItem) {
                const user = await User('buyer').updateOne(
                    {
                        _id: userId
                    }, {
                        $pull: {
                            SearchData: deleteItem
                        }
                    }
                )
                if(user.modifiedCount > 0){
                    return res.status(200).json({ message: "search deleted" })
                } 
            }
            if (search) {
                const user = await User('buyer').updateOne(
                    {
                        _id: userId
                    }, {
                        $push: { 
                            SearchData: {
                                $each: [search],
                                $slice: -20
                            }
                        }
                    }
                )
                if(user.modifiedCount > 0){
                    return res.status(200).json({ message: "new search added" })
                } else {
                    return res.status(200).json({ message: "Guess only" })
                }
            }
        }
    } catch (error) {
        console.error("Failed to push ", error)
    }
}

export const StripePayment = async (req: Request, res: Response) => {
    const { products, userId }: { products: product_types_stripe[]; userId: string } = req.body
    try {
        const user_exist = await User('buyer').findById(userId)
        if (!user_exist) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user_exist) {
           if(products) { //if products exist
                const productId = products.map((product) => product.productId || product._id)
                const LineItems = products.map((product) => ({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.productName,
                            images: [product.images[0]],
                        },
                        unit_amount: Number(product.price) || Number(product.productPrice) * 100, 
                    },
                    quantity: Number(product.quantity) || 1,
                }))
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: LineItems,
                    mode: 'payment',
                    success_url: `http://localhost:3000/payment/success/${userId}?ids=${encodeURIComponent(JSON.stringify(productId))}`,
                    cancel_url: 'http://localhost:3000/payment/cancelled',
                })
                if(session) {
                    console.log("session working")
                }
                return res.status(200).json({ id: session.id })
            }
        }
    } catch (error) {
        console.error(error)
    }
}

export const Orders = async (req: Request, res: Response) => {
    const { userId, cartProducts } = req.body
    try {
        const user_exist = await User('buyer').findById(userId)
        if (!user_exist) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user_exist) {
            if(cartProducts) {       
                const product_Ids = Array.isArray(cartProducts) ? cartProducts : [cartProducts]
                const productCart = await User('buyer').findOne(
                    {
                        _id: userId,
                        cart: {
                            $elemMatch: {
                                productId: { $in: product_Ids }
                            }
                        }
                    }
                )

                const products = await Product.findOne(
                    {
                        _id: cartProducts
                    }
                )

                if (productCart && productCart.cart.length > 0 ) {
                    const newOrder = productCart?.cart.map(cart => ({
                        productId: cart.productId,
                        productName: cart.productName,
                        images: cart.images,
                        quantity: cart.quantity,
                        price: cart.price
                    }))

                    const totalAmount = newOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    const order = {
                        orderId: new Types.ObjectId(),
                        items: newOrder,
                        totalAmount: totalAmount,
                        status: 'purchased', 
                        createdAt: new Date(),
                    }

                    const add_order = await User('buyer').updateOne(
                        {
                            _id: userId
                        }, {
                            $push: {
                                orders: order
                            }
                        }
                    )
                    const remove_cart = await User('buyer').updateOne(
                    {
                        _id: userId
                    }, {
                        $pull: {
                            cart: {
                                productId: { $in: cartProducts }
                            }
                        }
                    })
                    if(remove_cart.modifiedCount > 0 && add_order.modifiedCount > 0) {
                        return res.status(200).json({ message: "Update success" })
                    }
                } else {
                    const Items = {
                        productId: products?._id,
                        productName: products?.productName,
                        images: products?.images,
                        quantity: products?.productQuantity,
                        price: products?.productPrice
                    }

                    const order = {
                        orderId: new Types.ObjectId(),
                        items: Items,
                        totalAmount: 0,
                        status: 'purchased', 
                        createdAt: new Date(),
                    }

                    const add_order = await User('buyer').updateOne(
                        {
                            _id: userId
                        }, {
                            $push: {
                                orders: order
                            }
                        }
                    )

                    if(add_order.modifiedCount > 0) {
                        return res.status(200).json({ message: "Update success" })
                    }
                }
            }
        }
        else {
            return res.status(401).json({ message: "Unathorized user" })
        }
    } catch (error) {
        console.error(error)
    }
    
}

export const getOrderHistory = async (req: Request, res: Response) => {
    const { userId } = req.query

    try {
        const user_exist = await User('buyer').findById(userId)
        if(!user_exist) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const getData = await User('buyer').findOne(
                { _id: userId }, 
                { orders: 1 }
            )

            const Order_Items = getData?.orders.flatMap(order => order.items)
            if(!Order_Items) {
                return res.status(404).json({ message: "No Items found" })
            } else {
                return res.status(200).json({ Order_Items })
            }
        }
    } catch (error) {
        console.error("failed to get: ", error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

