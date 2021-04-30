import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

// nats client
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222' // with port forwarding to nats pod `k port-forward {nats-pod} 4222:4222`
});

stan.on('connect', () => {
  console.log('publisher is connected to nats streaming server...')

  const data = {
    id: '123',
    title: 'concert',
    price: 20
  };

  new TicketCreatedPublisher(stan).publish(data);
});
