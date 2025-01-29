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
               
                const LineItems = products.map((product) => {
                    // Use product.price if it exists, otherwise fall back to product.productPrice
                    const price = Number(product.price) || Number(product.productPrice);
                    const unitAmount = Math.round(price * 100); // Convert to cents
                    console.log(`Product: ${product.productName}, Unit Amount: ${unitAmount}, Quantity: ${product.quantity}`);
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: product.productName,
                                images: [product.images[0]],
                            },
                            unit_amount: unitAmount,
                        },
                        quantity: Number(product.quantity) || 1,
                    };
                });
                console.log("LineItems: ", LineItems)
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

                console.log("Product id: ", product_Ids)
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

                if (productCart && productCart.cart.length > 0 ) { //for buying from cart
                    const newOrder = productCart?.cart.map(cart => ({
                        productId: cart.productId,
                        productName: cart.productName,
                        images: cart.images,
                        quantity: cart.quantity,
                        price: cart.price
                    }))

                     //Start test           
                    const test_id =  [ '678f72497e911ffa2d947240' ]  

                    const buyer_information = await User('buyer').findOne({_id: userId}) 
                    console.log("buyer info: ", buyer_information) //buyer info

                    if(!buyer_information) {
                        return res.status(404).json({ message: "Buyer not found" })
                    }

                    console.log("Order 1: ", newOrder) //order details


                    const search_id_seller = await User('seller').findOne({ //change the test id later for actual id, if i already refactor the fetch in frontend
                        sellerProducts: {
                            $elemMatch: {
                                _id: { $in: test_id }
                            }
                        }
                    }) 

                    if(!search_id_seller) {
                        return res.status(404).json({ message: "Product not found" })
                    }

                    const add_on_orderlist = await User('seller').updateOne({  _id: search_id_seller._id }, {
                        $push: {
                            product_orders: {
                                buyer_firstName: buyer_information.FirstName,
                                buyer_lastName: buyer_information.LastName,
                                buyer_email: buyer_information.Email,
                                buyer_username: buyer_information.Username,
                                product: newOrder
                            }
                        }
                    })

                    if(add_on_orderlist.modifiedCount > 0) {
                        console.log("Order list updated")
                    } else {
                        console.log("Order list not updated")
                    }
                    //End test

                    const totalAmount = newOrder.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
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
                } else { //direct buy
                    const Items = {
                        productId: products?._id,
                        productName: products?.productName,
                        images: products?.images,
                        quantity: 1,
                        price: products?.productPrice
                    }

                       //Start test           
                       const test_id =  [ '678f72497e911ffa2d947240' ] //product_id i want to find in sellerproducts in seller
                       //sending product details to seller sellerproducts[]
                       const buyer_information = await User('buyer').findOne({_id: userId})
                       console.log("buyer info: ", buyer_information)
                       
   
                       const search_id_seller = await User('seller').findOne({ //change the test id later for actual id, if i already refactor the fetch in frontend
                           sellerProducts: {
                               $elemMatch: {
                                   _id: { $in: test_id }
                               }
                           }
                       }) 
   
                       if(!search_id_seller) {
                           return res.status(404).json({ message: "Product not found" })
                       }
   
                       const matchingProducts = search_id_seller.sellerProducts.filter(product => 
                           test_id.includes(product._id.toString())
                       );
   
                       console.log("quantity: 1")
                       
                       console.log("Found: ", matchingProducts);
                       //End test
   

                    const order = {
                        orderId: new Types.ObjectId(),
                        items: Items,
                        totalAmount: 0,
                        status: 'purchased', 
                        createdAt: new Date(),
                    }

                    console.log("Order 2: ", order)

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

