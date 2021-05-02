import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // create instance
  const ticket = Ticket.build({
    title: 'title',
    price: 5,
    userId: 'any'
  });

  // save to db
  await ticket.save();

  // fetch twice
  const instanceOne = await Ticket.findById(ticket.id);
  const instanceTwo = await Ticket.findById(ticket.id);

  // apply change to both
  instanceOne!.set({ price: 10 });
  instanceTwo!.set({ price: 15 });

  // save first
  await instanceOne!.save();

  // save second and expect error (outdated version)
  try {
    await instanceTwo!.save();
  } catch (err) {
    return done();
  }

  throw new Error('should not reach this point');
});

it('increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'title',
    price: 5,
    userId: 'any'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
