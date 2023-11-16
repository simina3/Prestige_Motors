import mongoose, { Schema, Types } from 'mongoose';

export interface Product {
  _id?: Types.ObjectId;
  name: string;
  price: number;
  img?: string;
  description?: string;
//   carItems: {
//     //user: Types.ObjectId;
//     qty: number;
//   }[];
//   orderItems: {
//     order: Types.ObjectId;
//     qty: number;
//     price: DoubleRange;
//   }[];
//   //orders: Types.ObjectId[];
}

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
  },
  description: {
    type: String,
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
