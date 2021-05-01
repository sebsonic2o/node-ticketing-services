import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const path = '/api/orders';

it('cannot be accessed when user is not signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`${path}/${id}`)
    .send()
    .expect(401);
});

it('returns error if order is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`${path}/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns error when user does not own order', async () => {
  const ticket = Ticket.build({
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
    .get(`${path}/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

it('returns order for given user', async () => {
  const ticket = Ticket.build({
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

  const response = await request(app)
    .get(`${path}/${order.id}`)
    .set('Cookie', cookie)
    .send();

  expect(response.status).toEqual(200);
  expect(response.body.id).toEqual(order.id);
  expect(response.body.ticket.id).toEqual(ticket.id);
});
