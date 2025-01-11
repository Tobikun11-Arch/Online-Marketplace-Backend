import { Types } from 'mongoose';

export interface ISellerProducts {
    productId: Types.ObjectId;
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
    productId: Types.ObjectId;
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