import mongoose, { Schema } from 'mongoose';
import { IOrder, ICartItem } from '../Interface/BuyerInterface'
import { IUser } from '../user'

export const CartItemSchema = new Schema<ICartItem>({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    images: { type: [String], required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
});

export const OrderSchema = new Schema<IOrder>({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    items: { type: [CartItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['purchased', 'cancelled'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    cancellationReason: { type: String },
});

export const buyerSchema = new Schema<IUser>({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    PhoneNumber: { type: String, required: true },
    PetName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Role: { type: String, default: 'buyer' }, // Fixed role for buyers
    Username: { type: String, required: true },
    SearchData: { type: [String], required: false },
    isVerifiedEmail: { type: Boolean, default: false },
    emailToken: { type: String },
    refreshToken: { type: String },
    cart: { type: [CartItemSchema], default: [] }, // Only for buyers
    orders: { type: [OrderSchema], default: [] }, // Only for buyers
}, { collection: 'Buyer_Accounts', timestamps: true });
