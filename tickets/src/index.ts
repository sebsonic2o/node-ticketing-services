import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await natsWrapper.connect('ticketing', '1234', 'http://nats-str-srv:4222');
    natsWrapper.client.on('close', () => {
      console.log('nats connection closed...');
      process.exit();
    });
    process.on('SIGINT', () => { natsWrapper.client.close() });
    process.on('SIGTERM', () => { natsWrapper.client.close() });

    console.log('connecting to mongo db...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('connected to mongo db');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('listening on port 3000...');
  });
};

start();
