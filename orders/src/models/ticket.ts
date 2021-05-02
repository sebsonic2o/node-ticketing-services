import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
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
  findByEvent(event: { id: string, version: number }): Promise<TicketDocument | null>;
}

// an interface to describe the document properties
export interface TicketDocument extends mongoose.Document {
  title: string;
  price: number;
  version: number;
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
    }
  }
});

TicketSchema.set('versionKey', 'version'); // instead of __v
TicketSchema.plugin(updateIfCurrentPlugin);

// a custom function to plug in type checking into model
TicketSchema.statics.build = (attrs: TicketAttributes) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

TicketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
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
