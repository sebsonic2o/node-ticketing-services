import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@sebsonic2o-org/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async (orderStatus?: OrderStatus) => {
  // create listener instance
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: orderStatus,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  // create fake data
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
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

  const order = await Order.findById(data.orderId);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes order cancelled event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith('order:cancelled', expect.anything(), expect.anything());
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, msg);

  // assert ack function call
  expect(msg.ack).toHaveBeenCalled();
});

it('does not cancel order when complete', async () => {
  const { listener, data, msg } = await setup(OrderStatus.Complete);

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.orderId);

  expect(order!.status).not.toEqual(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});
