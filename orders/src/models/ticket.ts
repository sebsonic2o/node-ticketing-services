import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// an interface to describe the properties required to create
interface TicketAttributes {
  id: string;
  title: string;
  price: number;
}

// an interface to describe the model properties
interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttributes): TicketDocument;
}

// an interface to describe the document properties
export interface TicketDocument extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
      delete ret.__v;
    }
  }
});

// a custom function to plug in type checking into model
TicketSchema.statics.build = (attrs: TicketAttributes) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

// adding custom method to document
TicketSchema.methods.isReserved = async function() {
  // `this` refers to document
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', TicketSchema);

export { Ticket };
