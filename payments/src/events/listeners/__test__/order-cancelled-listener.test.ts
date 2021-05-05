import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@sebsonic2o-org/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  // create listener instance
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create order
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 100
  });
  await order.save();

  // create fake data
  const data: OrderCancelledEvent['data'] = {
    version: order.version + 1,
    id: order.id,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString()
    }
  };

  // create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('cancels order', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
  expect(order!.version).toEqual(data.version);
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

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
