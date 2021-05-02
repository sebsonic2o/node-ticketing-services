import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const path = '/api/orders';

const createTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });

  await ticket.save();

  return ticket;
}

it('cannot be accessed when user is not signed in', async () => {
  await request(app)
    .get(path)
    .send()
    .expect(401);
});

it('can be accessed when user is signed in', async () => {
  const response = await request(app)
    .get(path)
    .set('Cookie', global.signin())
    .send();

  expect(response.status).not.toEqual(401);
});

it('returns list of orders for given user', async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  await request(app)
    .post(path)
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post(path)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post(path)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const response = await request(app)
    .get(path)
    .set('Cookie', userTwo)
    .send();

  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
