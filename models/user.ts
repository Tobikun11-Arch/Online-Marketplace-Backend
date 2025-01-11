import mongoose, { Document, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { IOrder, ICartItem } from './Interface/BuyerInterface'
import { ISellerProducts, IDraftProducts } from './Interface/SellerInterface'
import { buyerSchema } from './Schemas/BuyerSchema'
import { sellerSchema } from './Schemas/SellerSchema'

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
    sellerProducts: ISellerProducts[]
    draftProducts: IDraftProducts[]
}


const comparePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.Password);
};

buyerSchema.methods.comparePassword = comparePassword;
sellerSchema.methods.comparePassword = comparePassword;

const modelCache: { [key: string]: Model<IUser> } = {};

// Dynamic user model function
const User = (role: 'buyer' | 'seller'): Model<IUser> => {
    const collectionName = role === 'buyer' ? 'BuyerAccounts' : 'SellerAccounts';
    const schema = role === 'buyer' ? buyerSchema : sellerSchema;

    // Check if the model is already cached
    if (modelCache[collectionName]) {
        return modelCache[collectionName];
    }

    // Create and cache the model
    const model = mongoose.model<IUser>('User', schema, collectionName);
    modelCache[collectionName] = model;

    return model;
};

export default User;