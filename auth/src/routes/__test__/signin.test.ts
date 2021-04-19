import request from 'supertest';
import { app } from '../../app';

const path = '/api/users/signin';

it('returns 200 and sets cookie on successful signin', async () => {
  await global.signup({ email: 'valid@email.com', password: '12345678' });

  const response = await request(app)
    .post(path)
    .send({
      email: 'valid@email.com',
      password: '12345678'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

it('returns 400 when email does not exist', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'valid@email.com',
      password: '12345678'
    })
    .expect(400);
});

it('returns 400 when password does not match', async () => {
  await global.signup({ email: 'valid@email.com', password: '12345678' });

  await request(app)
    .post(path)
    .send({
      email: 'valid@email.com',
      password: '87654321'
    })
    .expect(400);
});

it('returns 400 with invalid email', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'invalidEmail',
      password: '12345678'
    })
    .expect(400);
});

it('returns 400 with missing email or password', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'valid@email.com'
    })
    .expect(400);

  await request(app)
    .post(path)
    .send({
      password: '12345678'
    })
    .expect(400);
});
