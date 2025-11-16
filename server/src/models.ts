import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productName: string;
  quantity: number;
  price: number;
  productId?: mongoose.Types.ObjectId;
  assignedItems?: IProductItem[]; // Digital items assigned after purchase
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  isPurchased?: boolean;
  purchaseDate?: Date;
  createdAt: Date;
}

export interface IPayment extends Document {
  user?: mongoose.Types.ObjectId; // optional for front-end local users
  userLocalId?: string; // localStorage user id from client
  email?: string;
  amount: number;
  method: string;
  status: string; // pending | completed | failed
  reference?: string; // our internal paymentReference
  transactionReference?: string; // gateway reference
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  balance?: number;
  createdAt: Date;
}

export interface IAdmin extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}

export interface IProductItem {
  _id?: mongoose.Types.ObjectId;
  username: string;
  password: string;
  twoFactorAuth?: string;
  emailAddress: string;
  recoveryPassword?: string;
  isSold: boolean;
  soldTo?: mongoose.Types.ObjectId; // User who purchased
  soldAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  items: IProductItem[]; // Array of account credentials
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  assignedItems: { type: [ProductItemSchema], default: [] },
});

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [CartItemSchema], default: [] },
  isPurchased: { type: Boolean, default: false },
  purchaseDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false },
  userLocalId: { type: String },
  email: { type: String },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, required: true },
  reference: { type: String },
  transactionReference: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ProductItemSchema = new Schema<IProductItem>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  twoFactorAuth: { type: String },
  emailAddress: { type: String, required: true },
  recoveryPassword: { type: String },
  isSold: { type: Boolean, default: false },
  soldTo: { type: Schema.Types.ObjectId, ref: "User" },
  soldAt: { type: Date },
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  imageUrl: { type: String },
  items: { type: [ProductItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export const User = mongoose.model<IUser>("User", UserSchema);
export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
export const Product = mongoose.model<IProduct>("Product", ProductSchema);
