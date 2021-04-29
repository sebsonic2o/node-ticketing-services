import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';

export class TicketCreatedListener extends Listener {
  subject = 'ticket:created';
  queueGroupName = 'listener-service';

  onMessage(data: any, msg: Message) {
    console.log('with event data', data);

    msg.ack();
  }
}
