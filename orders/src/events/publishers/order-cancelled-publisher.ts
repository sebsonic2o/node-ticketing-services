import { Publisher, Subject, OrderCancelledEvent } from '@sebsonic2o-org/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subject.OrderCancelled;
}
