import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
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
  createdAt: Date;
}

export interface IAdmin extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [CartItemSchema], default: [] },
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
  createdAt: { type: Date, default: Date.now },
});

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export const User = mongoose.model<IUser>("User", UserSchema);
export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
