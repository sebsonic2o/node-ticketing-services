import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@sebsonic2o-org/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create listener instance
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  // create fake data
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'newtitle',
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('updates ticket', async () => {
  const { listener, data, msg } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, msg);

  // assert ticket update
  const ticket = await Ticket.findById(data.id);

  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.version).toEqual(data.version);
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, msg);

  // assert ack function call
  expect(msg.ack).toHaveBeenCalled();
});

it('does not acknowledge out-of-order events', async () => {
  const { listener, data, msg } = await setup();

  data.version += 1;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
