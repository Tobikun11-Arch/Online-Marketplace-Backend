import mongoose, { Schema } from 'mongoose';
import { ISellerProducts, IDraftProducts } from '../Interface/SellerInterface'
import { IUser } from '../user'

const SellerProducts = new Schema<ISellerProducts>({
    productName: { type: String, required: true },
    status: { type: String, required: true },
    productDescription: { type: String, required: true },
    productCategory: { type: String, required: true },
    productQuality: { type: String, required: true },
    productStock: { type: Number, required: true },
    Sku: { type: String, required: false },
    productSize: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productDiscount: { type: Number, required: false },
    images: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const DraftProducts = new Schema<IDraftProducts>({
    productName: { type: String, required: false, default: 'Untitled Product' },
    status: { type: String, required: false, default: 'draft' },
    productDescription: { type: String, required: false, default: '' },
    productCategory: { type: String, required: false, default: 'Uncategorized' },
    productQuality: { type: String, required: false, default: 'Standard' },
    productStock: { type: Number, required: false, default: 0 },
    Sku: { type: String, required: false, default: '' },
    productSize: { type: String, required: false, default: 'Medium' },
    productPrice: { type: Number, required: false, default: 0 },
    productDiscount: { type: Number, required: false, default: 0 },
    images: { type: [String], required: false, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const sellerSchema = new Schema<IUser>({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    PhoneNumber: { type: String, required: true },
    PetName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Role: { type: String, default: 'seller' }, // Fixed role for sellers
    Username: { type: String, required: true },
    SearchData: { type: [String], required: false },
    isVerifiedEmail: { type: Boolean, default: false },
    emailToken: { type: String },
    refreshToken: { type: String },
    sellerProducts: { type: [SellerProducts], default: [] }, // Only for sellers
    draftProducts: { type: [DraftProducts], default: [] },
}, { collection: 'Seller_Accounts', timestamps: true });