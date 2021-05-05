import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@sebsonic2o-org/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create listener instance
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create ticket
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'title',
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString()
  });
  ticket.set({ orderId });
  await ticket.save();

  // create fake data
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
      id: ticket.id
    }
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('releases ticket by unsetting order id', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toBeUndefined();
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
