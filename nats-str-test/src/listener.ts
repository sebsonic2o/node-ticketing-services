import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

// nats client
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222' // with port forwarding to nats pod `k port-forward {nats-pod} 4222:4222`
});

stan.on('connect', () => {
  console.log('listener is connected to nats streaming server...')

  const subscription = stan.subscribe('ticket:created');

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();

    if (typeof data === 'string') {
      console.log(
        `received event #${msg.getSequence()}, with data:\n${data}`
      );
    }
  });
});
