import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { PaymentCreatedEvent } from '@sebsonic2o-org/common';
import { PaymentCreatedListener } from '../payment-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  // create listener instance
  const listener = new PaymentCreatedListener(natsWrapper.client);

  // create order
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100
  });
  await ticket.save();

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  // create fake data
  const data: PaymentCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    chargeId: 'any'
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

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.orderId);

  expect(order!.status).toEqual(OrderStatus.Complete);
});

it('acknowledges message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
