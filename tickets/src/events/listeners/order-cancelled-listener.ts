import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCancelledEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subject.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    msg.ack();
  }
}
