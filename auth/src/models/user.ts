import mongoose from 'mongoose';

// an interface to describe the properties required to create a User
interface UserAttributes {
  email: string;
  password: string;
}

// an interface to describe the properties that a User model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttributes): any;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});

// a custom function to plug in type checking into model
userSchema.statics.build = (attrs: UserAttributes) => {
  return new User(attrs);
};

const User = mongoose.model<any, UserModel>('User', userSchema);

export { User };
