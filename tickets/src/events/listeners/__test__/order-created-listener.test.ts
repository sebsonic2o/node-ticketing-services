import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent } from '@sebsonic2o-org/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create listener instance
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  // create fake data
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    },
    userId: mongoose.Types.ObjectId().toHexString()
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('reserves ticket by setting order id', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toEqual(data.id);
});

it('publishes ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('ticket:updated', expect.anything(), expect.anything());
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
