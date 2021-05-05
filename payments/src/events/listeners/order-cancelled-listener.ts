import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCancelledEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subject.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('order not found');
    }

    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();

    msg.ack();
  }
}
