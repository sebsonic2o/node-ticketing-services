import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '12345678'
    })
    .expect(201);
});

it('sets cookie on successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '12345678'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});

it('returns 400 with invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'invalidEmail',
      password: '12345678'
    })
    .expect(400);
});

it('returns 400 with invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '123'
    })
    .expect(400);
});

it('returns 400 with missing email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: '12345678'
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '12345678'
    })
    .expect(201);

   await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '87654321'
    })
    .expect(400);
});
