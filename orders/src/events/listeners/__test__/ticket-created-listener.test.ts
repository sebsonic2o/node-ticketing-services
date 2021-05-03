import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@sebsonic2o-org/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create listener instance
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('creates ticket', async () => {
  const { listener, data, msg } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, msg);

  // assert ticket creation
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, msg);

  // assert ack function call
  expect(msg.ack).toHaveBeenCalled();
});
