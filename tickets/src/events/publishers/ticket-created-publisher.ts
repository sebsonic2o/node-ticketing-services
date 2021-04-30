import { Publisher, Subject, TicketCreatedEvent } from '@sebsonic2o-org/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subject.TicketCreated;
}
