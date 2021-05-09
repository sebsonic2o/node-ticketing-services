import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const path = '/api/tickets';

const createTicket = () => {
  return request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 100 })
};

it('returns list of tickets that are not reserved', async () => {
  const n = 3;

  for (let i=0; i<n; i++) {
    await createTicket();
  }

  const ticket = await Ticket.findOne();
  ticket!.set({
    orderId: mongoose.Types.ObjectId().toHexString()
  });
  await ticket!.save();

  const response = await request(app)
    .get(path)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(n-1);
});
