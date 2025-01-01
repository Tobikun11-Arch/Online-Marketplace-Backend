import { Types } from "mongoose";

export interface product_types_stripe {
    productName: string
    images: string[];
    price: number;
    quantity: number
    productId?: Types.ObjectId;
}