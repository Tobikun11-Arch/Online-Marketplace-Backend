import { Request, Response } from 'express';
import User from '../models/user';

export const Categories = async(req: Request, res: Response) => {
    try {
        const categories = ['Fashion', 'Electronics', 'Home & Kitchen', 'Automotive']

        //New structure
        const newResults: Record<string, any[]> = {}
       //Implementing new code blocks
       for (const category of categories) {
            const newCategory = await User('seller').find({}).select('sellerProducts')
            const product_length = newCategory.flatMap(seller_category => seller_category.sellerProducts)
            const found_category = product_length.filter(product => product.productCategory == category)
            newResults[category] = found_category.length > 0 ? found_category : [];
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


export const UserSales = async(req: Request, res: Response) => {
    //Recent activities - list of new added on seller products & draft productts slice (0,4)
    
    try {
        const { userId } = req.query
        const user = await User('seller').findById(userId)

        if(!user) {
            return res.status(404).json({ error: "No user found" })
        }

        let totalIncome = 0

        //data for total income
        const product_orders = user.product_orders
        const product = product_orders.map(product=> product.product.map(data => ({
            ProductQuantity: data.quantity,
            ProductPrice: data.price,
        })))

        product.forEach(order=> {
            order.forEach(item=> {
                totalIncome += item.ProductQuantity * item.ProductPrice
            })
        })

        //Total buyer
        const buyer_info = user.product_orders.map((buyer)=> ({
            email: buyer.buyer_email
        }))

        const buyer_count = buyer_info?.filter((word, index, self) => //buyers count
            index === self.findIndex(w => word.email === w.email)
        ).length

        //Total discount
        let TotalDiscount = 0;

        const seller_products = user.sellerProducts;
        product_orders.forEach(order => {
        order.product.forEach(product => {
            const productId = product.productId; // Get the productId from the order

            const matchingSellerProduct = seller_products.find(sellerProduct => 
            sellerProduct._id.toString() === productId.toString() // Compare productId and _id
            );

            if (matchingSellerProduct) {
                const revenue = product.quantity * product.price;
                const discount = (revenue * matchingSellerProduct.productDiscount) / 100; 
                TotalDiscount += discount;
            }
        });
        });

        const Total = {
            Total_income: totalIncome,
            Total_buyer: buyer_count,
            Total_orders: product.length,
            Total_discount: parseInt(TotalDiscount.toFixed(2))
        }

        //Review orders - new product added in product orders, sort it with recently added and slice to (0,3)
        const product_data = product_orders.flatMap(order=> order.product.map(product=> ({
            productName: product.productName,
            AddedAt: new Date(product.addedAt),
            productQuantity: product.quantity,
            productPrice: product.price
        })))
        .sort((a, b)=> b.AddedAt.getTime() - a.AddedAt.getTime())

        //Top buyer - based on total purchases in customer list slice(0,3)
        const orders_product = await User('seller').findOne(
            {_id: userId},
            { product_orders: 1 }
        )

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
        }))

        //Sales
        const Sales = totalIncome - parseInt(TotalDiscount.toFixed(2))

        //Review orders
        const ReviewOrder = product_data.slice(0,3)

        //Recent Activities
        const Activities = await User('seller')
        .findOne({ _id: userId })
        .select('sellerProducts draftProducts')
        .lean();

        const sortedActivities = [
            ...(Activities?.sellerProducts || []),
            ...(Activities?.draftProducts || [])
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,3)

        //Top Buyer
        const sortedCustomerList = customer_list?.sort((a, b) => b.total_purchases - a.total_purchases).slice(0,3)

        const chartTotal = {
            Sales: Sales,
            ReviewOrder: ReviewOrder,
            RecentAct: sortedActivities,
            TopBuyer: sortedCustomerList
        }

        return res.status(200).json({ TotalData: [Total], Chart: [chartTotal] })
    } catch (error) {
        console.error("Fetching error: ", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}