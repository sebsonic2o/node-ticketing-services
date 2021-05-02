import { Message } from 'node-nats-streaming';
import { Listener, Subject, TicketCreatedEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subject.TicketCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { title, price } = data;

    const ticket = Ticket.build({
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}
