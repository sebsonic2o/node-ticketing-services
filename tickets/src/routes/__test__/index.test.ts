import request from 'supertest';
import { app } from '../../app';

const path = '/api/tickets';

const createTicket = () => {
  return request(app)
    .post(path)
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 100 })
};

it('returns list of tickets', async () => {
  const n = 3;

  for(let i=0; i<n; i++) {
    await createTicket();
  }

  const response = await request(app)
    .get(path)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(n);
});
