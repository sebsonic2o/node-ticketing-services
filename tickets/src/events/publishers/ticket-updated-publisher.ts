import { Publisher, Subject, TicketUpdatedEvent } from '@sebsonic2o-org/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subject.TicketUpdated;
}
