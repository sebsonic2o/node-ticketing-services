import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';

declare global {
  namespace NodeJS {
    interface Global {
      signin({ email }?: { email?: string }): string[]
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'key';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = ({ email = 'test@test.com' } = {}) => {
  // build jwt payload
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email
  };

  // generate jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object
  const session = { jwt: token };

  // turn to json
  const sessionJSON = JSON.stringify(session);

  // encode as base64
  const sessionBase64 = Buffer.from(sessionJSON).toString('base64');

  // return cookie string (in array for supertest) with encoded data
  return [`express:sess=${sessionBase64}`];
};
