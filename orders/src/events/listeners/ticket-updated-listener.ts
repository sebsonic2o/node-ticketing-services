import { Message } from 'node-nats-streaming';
import { Listener, Subject, TicketUpdatedEvent } from '@sebsonic2o-org/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subject.TicketUpdated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, version, title, price } = data;
    const ticket = await Ticket.findOne({
      _id: id,
      version: version - 1
    });

    if (!ticket) {
      throw new Error('ticket not found');
    }

    ticket.set({
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}
