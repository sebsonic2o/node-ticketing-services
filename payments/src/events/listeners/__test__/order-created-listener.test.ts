import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent } from '@sebsonic2o-org/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  // create listener instance
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create fake data
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: new Date().toISOString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 100
    }
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('creates order', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.userId).toEqual(data.userId);
  expect(order!.version).toEqual(data.version);
  expect(order!.status).toEqual(OrderStatus.Created);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
