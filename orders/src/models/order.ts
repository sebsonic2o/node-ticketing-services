import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@sebsonic2o-org/common';
import { TicketDocument } from './ticket';

export { OrderStatus };

// an interface to describe the properties required to create
interface OrderAttributes {
  userId: string;
  status?: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
}

// an interface to describe the model properties
interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attrs: OrderAttributes): OrderDocument;
}

// an interface to describe the document properties
interface OrderDocument extends mongoose.Document {
  userId: string;
  version: number;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
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
  expiresAt: {
    type: mongoose.Schema.Types.Date
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
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
  return new Order(attrs);
};

const Order = mongoose.model<OrderDocument, OrderModel>('Order', OrderSchema);

export { Order };
