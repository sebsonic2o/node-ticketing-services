import { Publisher, Subject, OrderCreatedEvent } from '@sebsonic2o-org/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subject.OrderCreated;
}
