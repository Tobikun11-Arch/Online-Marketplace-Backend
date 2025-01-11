import { Types } from 'mongoose';

export interface ICartItem {
    productId: Types.ObjectId;
    productName: string
    images: string[];
    quantity: number;
    price: number;
    addedAt: Date;
}

export interface IOrder {
    orderId: Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    status: 'purchased' | 'cancelled';
    createdAt: Date;
    updatedAt?: Date;
    cancellationReason?: string;
}