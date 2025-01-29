import { Types } from 'mongoose';
import { ICartItem } from './BuyerInterface';

export interface ISellerProducts {
    _id: Types.ObjectId;
    productName: string;
    status: string;
    productDescription: string;
    productCategory: string;
    productQuality: string;
    productStock: number;
    Sku: string;
    productSize: string;
    productPrice: number;
    productDiscount: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IDraftProducts {
    _id: Types.ObjectId;
    productName: string;
    publication_status: string;
    status: string;
    productDescription: string;
    productCategory: string;
    productQuality: string;
    productStock: number;
    Sku: string;
    productSize: string;
    productPrice: number;
    productDiscount: number;
    images: string[]; 
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderList {
    buyer_firstName: string;
    buyer_lastName: string;
    buyer_email: string;
    buyer_username: string;
    product: ICartItem;
}