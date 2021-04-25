import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

const path = '/api/tickets';

it('returns ticket if ticket is found', async () => {
  const title = 'title';
  const price = 100;

  const response = await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`${path}/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it('returns error if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`${path}/${id}`)
    .send()
    .expect(404);
});
