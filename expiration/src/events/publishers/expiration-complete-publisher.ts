import { Publisher, Subject, ExpirationCompleteEvent } from '@sebsonic2o-org/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subject.ExpirationComplete;
}
