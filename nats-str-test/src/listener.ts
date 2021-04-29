import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

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

  const options = stan.subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName('listener-service');

  const subscription = stan.subscribe(
    'ticket:created',
    'listener-queue-group',
    options
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();

    if (typeof data === 'string') {
      console.log(
        `received event #${msg.getSequence()}, with data:\n${data}`
      );
    }

    msg.ack();
  });
});

process.on('SIGINT', () => { stan.close() });
process.on('SIGTERM', () => { stan.close() });
