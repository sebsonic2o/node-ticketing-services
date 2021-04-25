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

});

it('returns error with invalid title', async () => {

});

it('returns error with invalid price', async () => {

});

it('creates ticket with valid inputs', async () => {

});
