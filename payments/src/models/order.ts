import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@sebsonic2o-org/common';

export { OrderStatus };

// an interface to describe the properties required to create
interface OrderAttributes {
  id: string;
  userId: string;
  status?: OrderStatus;
  price: number;
}

// an interface to describe the model properties
interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attrs: OrderAttributes): OrderDocument;
}

// an interface to describe the document properties
interface OrderDocument extends mongoose.Document {
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

OrderSchema.set('versionKey', 'version'); // instead of __v
OrderSchema.plugin(updateIfCurrentPlugin);

// a custom function to plug in type checking into model
OrderSchema.statics.build = (attrs: OrderAttributes) => {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price
  });
};

const Order = mongoose.model<OrderDocument, OrderModel>('Order', OrderSchema);

export { Order };
