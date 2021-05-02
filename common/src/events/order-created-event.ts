import { Subject } from './subject';

export interface OrderCreatedEvent {
  subject: Subject.OrderCreated;
  data: {
    id: string;
    expiresAt: string;
    userId: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
