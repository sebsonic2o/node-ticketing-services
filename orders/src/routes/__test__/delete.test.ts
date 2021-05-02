import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const path = '/api/orders';

it('cannot be accessed when user is not signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`${path}/${id}`)
    .send()
    .expect(401);
});

it('returns error if order is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`${path}/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns error when user does not own order', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .delete(`${path}/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

it('cancels order for given user', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .delete(`${path}/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const response = await request(app)
    .get(`${path}/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it('publishes an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .delete(`${path}/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('order:cancelled', expect.anything(), expect.anything());
});
