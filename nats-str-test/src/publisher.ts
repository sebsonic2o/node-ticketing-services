import nats from 'node-nats-streaming';

console.clear();

// nats client
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222' // with port forwarding to nats pod `k port-forward {nats-pod} 4222:4222`
});

stan.on('connect', () => {
  console.log('publisher is connected to nats streaming server...')

  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20
  });

  stan.publish('ticket:created', data, () => {
    console.log('event published...');
  });
});
