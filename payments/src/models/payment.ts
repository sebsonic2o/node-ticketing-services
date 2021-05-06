import mongoose from 'mongoose';

// an interface to describe the properties required to create
interface PaymentAttributes {
  orderId: string;
  chargeId: string;
}

// an interface to describe the model properties
interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attrs: PaymentAttributes): PaymentDocument;
}

// an interface to describe the document properties
interface PaymentDocument extends mongoose.Document {
  orderId: string;
  chargeId: string;
}

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  chargeId: {
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
PaymentSchema.statics.build = (attrs: PaymentAttributes) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', PaymentSchema);

export { Payment };
