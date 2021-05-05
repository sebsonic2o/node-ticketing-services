import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const path = '/api/tickets';

it('cannot be accessed when user is not signed in', async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`${path}/${id}`)
    .send({
      title: 'title',
      price: 100
    })
    .expect(401);
});

it('returns error when ticket is reserved', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`${path}/${ticket!.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newtitle',
      price: 200
    })
    .expect(400);
});

it('returns error when user does not own ticket', async () => {
  const response = await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  await request(app)
    .put(`${path}/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'newtitle',
      price: 200
    })
    .expect(401);
});

it('returns error with invalid title or price', async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`${path}/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 100
    })
    .expect(400);

  await request(app)
    .put(`${path}/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -10
    })
    .expect(400);
});

it('returns error if ticket does not exist', async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`${path}/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 100
    })
    .expect(404);
});

it('updates ticket with valid input', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  const newTitle = 'newtitle';
  const newPrice = 200;

  await request(app)
    .put(`${path}/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`${path}/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice);
});

it('publishes a ticket updated event', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  await request(app)
    .put(`${path}/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newtitle',
      price: 200
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('ticket:updated', expect.anything(), expect.anything());
});
