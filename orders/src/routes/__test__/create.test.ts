import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const path = '/api/orders';

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

it('can be accessed when user is signed in', async () => {
  const response = await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns error with invalid ticket id', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ ticketId: '' })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ ticketId: 'any' })
    .expect(400);
});

it('returns error if ticket does not exist', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ ticketId: mongoose.Types.ObjectId().toHexString() })
    .expect(404);
});

it('returns error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const order = Order.build({
    userId: 'any',
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('creates order with valid input', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  let orders = await Order.find({});
  expect(orders.length).toEqual(0);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  orders = await Order.find({});
  expect(orders.length).toEqual(1);
});

it('publishes an order created event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('order:created', expect.anything(), expect.anything());
});
