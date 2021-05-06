import { Message } from 'node-nats-streaming';
import { Listener, Subject, PaymentCreatedEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subject.PaymentCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('order not found');
    }

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();

    msg.ack();
  }
}
