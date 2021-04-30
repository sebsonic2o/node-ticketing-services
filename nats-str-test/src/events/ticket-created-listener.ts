import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subject } from './subject';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subject.TicketCreated;
  queueGroupName = 'listener-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('with event data', data);

    msg.ack();
  }
}
