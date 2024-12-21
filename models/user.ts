import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ICartItem {
    productId: Types.ObjectId;
    productName: string
    images: string[];
    quantity: number;
    price: number;
    addedAt: Date;
}

export interface IOrder {
    orderId: string;
    items: ICartItem[];
    totalAmount: number;
    status: 'purchased' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    cancellationReason?: string;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    PetName: string;
    Email: string;
    Password: string;
    Role: 'buyer' | 'seller'; // Restrict to predefined roles
    Username: string;
    SearchData: string[];
    isVerifiedEmail: boolean;
    emailToken?: string;
    refreshToken?: string;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    cart: ICartItem[];
    orders: IOrder[];
}


const CartItemSchema = new Schema<ICartItem>({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    images: { type: [String], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
});

const OrderSchema = new Schema<IOrder>({
    orderId: { type: String, required: true },
    items: { type: [CartItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['purchased', 'cancelled'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    cancellationReason: { type: String },
});


const userSchema = new Schema<IUser>({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    PhoneNumber: { type: String, required: true },
    PetName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Role: { type: String, enum: ['buyer', 'seller'], required: true },
    Username: { type: String, required: true },
    SearchData: { type: [String], required: false },
    isVerifiedEmail: { type: Boolean, default: false },
    emailToken: { type: String },
    refreshToken: { type: String },
    cart: { type: [CartItemSchema], default: [] },
    orders: { type: [OrderSchema], default: [] },
}, { collection: 'SellerAccounts', timestamps: true });


userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.Password);
};

// Dynamic user model function
const User = (role: 'buyer' | 'seller'): Model<IUser> => {
    const collectionName = role === 'buyer' ? 'BuyerAccounts' : 'SellerAccounts';
    return mongoose.model<IUser>('User', userSchema, collectionName);
};

export default User;