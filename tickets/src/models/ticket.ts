import mongoose from 'mongoose';

// an interface to describe the properties required to create
interface TicketAttributes {
  title: string;
  price: number;
  userId: string
}

// an interface to describe the model properties
interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttributes): TicketDocument;
}

// an interface to describe the document properties
interface TicketDocument extends mongoose.Document {
  title: string;
  price: number;
  userId: string
}

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
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
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', TicketSchema);

export { Ticket };
