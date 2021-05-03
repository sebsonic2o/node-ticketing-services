import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCreatedEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subject.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    msg.ack();
  }
}
