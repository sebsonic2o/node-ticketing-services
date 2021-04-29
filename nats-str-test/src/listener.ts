import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// nats client
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222' // with port forwarding to nats pod `k port-forward {nats-pod} 4222:4222`
});

stan.on('connect', () => {
  console.log('listener is connected to nats streaming server...')

  stan.on('close', () => {
    console.log('nats connection closed...');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => { stan.close() });
process.on('SIGTERM', () => { stan.close() });
