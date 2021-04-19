import request from 'supertest';
import { app } from '../../app';

const path = '/api/users/currentuser';

it('responds with details about the current user', async () => {
  const cookie = await global.signup({ email: 'valid@email.com' });

  const response = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('valid@email.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get(path)
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeNull();
});
