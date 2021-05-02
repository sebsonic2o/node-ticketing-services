import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const path = '/api/tickets';

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

it('returns error with invalid title', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 100
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      price: 100
    })
    .expect(400);
});

it('returns error with invalid price', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -10
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: 'title'
    })
    .expect(400);
});

it('creates ticket with valid input', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it('publishes a ticket created event', async () => {
  await request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 100
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('ticket:created', expect.anything(), expect.anything());
});
