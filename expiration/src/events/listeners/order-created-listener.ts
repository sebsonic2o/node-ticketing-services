import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCreatedEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subject.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log(`waiting to process expiration in ${delay}ms`);

    await expirationQueue.add({
      orderId: data.id
    },
    {
      delay
    });

    msg.ack();
  }
}
