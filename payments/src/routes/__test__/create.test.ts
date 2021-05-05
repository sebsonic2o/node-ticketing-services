import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';

const path = '/api/payments';

it('listens for post requests to path', async () => {
  const response = await request(app)
    .post(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('cannot be accessed when user is not signed in', async () => {
  await request(app)
    .post(path)
    .send({})
    .expect(401);
});

it('returns error with invalid order id', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      orderId: '',
      token: 'any'
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      orderId: 'any',
      token: 'any'
    })
    .expect(400);
});

it('returns error with empty token', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: ''
    })
    .expect(400);
});

it('returns error when order does not exist', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: 'any'
    })
    .expect(404);
});

it('returns error when purchasing order not belonging to user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 100
  });
  await order.save();

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'any'
    })
    .expect(401);
});

it('returns error when purchasing cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    status: OrderStatus.Cancelled,
    price: 100
  });
  await order.save();

  await request(app)
    .post(path)
    .set('Cookie', global.signin({ id: userId }))
    .send({
      orderId: order.id,
      token: 'any'
    })
    .expect(400);
});
