import { Request, Response } from 'express';
import User from '../models/user';
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
                const productId = products.map((product) => product.productId) 
                const firstProductId  = productId[0]
                const LineItems = products.map((product) => ({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.productName,
                            images: [product.images[0]],
                        },
                        unit_amount: product.price * 100,
                    },
                    quantity: product.quantity,
                }))

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: LineItems,
                    mode: 'payment',
                    success_url: `http://localhost:3000/payment/success/${firstProductId}?ids=${encodeURIComponent(JSON.stringify(productId))}`,
                    cancel_url: 'http://localhost:3000/payment/success',
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