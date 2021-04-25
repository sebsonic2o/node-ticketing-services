import request from 'supertest';
import { app } from '../../app';

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

});
