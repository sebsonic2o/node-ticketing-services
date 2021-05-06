import { Publisher, Subject, PaymentCreatedEvent } from '@sebsonic2o-org/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subject.PaymentCreated;
}
