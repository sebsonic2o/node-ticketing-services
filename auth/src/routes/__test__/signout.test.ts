import request from 'supertest';
import { app } from '../../app';

it('returns 200 and clears cookie on successful signout', async () => {
  await global.signup({ email: 'valid@email.com', password: '12345678' });

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
