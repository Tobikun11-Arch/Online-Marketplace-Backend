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