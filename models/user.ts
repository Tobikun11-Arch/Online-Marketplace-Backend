import mongoose, { Document, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { IOrder, ICartItem } from './Interface/BuyerInterface'
import { ISellerProducts, IDraftProducts, OrderList } from './Interface/SellerInterface'
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

    //buyer
    cart: ICartItem[];
    orders: IOrder[];

    //seller
    sellerProducts: ISellerProducts[]
    draftProducts: IDraftProducts[]
    product_orders: OrderList[]
}


const comparePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.Password);
};

buyerSchema.methods.comparePassword = comparePassword;
sellerSchema.methods.comparePassword = comparePassword;

const modelCache: { [key: string]: Model<IUser> } = {};

// Dynamic user model function
const User = (role: 'buyer' | 'seller'): Model<IUser> => {
  const collectionName = role === 'buyer' ? 'Buyer_Accounts' : 'Seller_Accounts';
  const schema = role === 'buyer' ? buyerSchema : sellerSchema;

  // Generate a unique model name based on the role
  const modelName = `User_${role}`; // e.g., 'User_buyer' or 'User_seller'

  // Check if the model is already cached
  if (modelCache[modelName]) {
    return modelCache[modelName];
  }

  // Create and cache the model
  const model = mongoose.model<IUser>(modelName, schema, collectionName);
  modelCache[modelName] = model;

  return model;
};

export default User;