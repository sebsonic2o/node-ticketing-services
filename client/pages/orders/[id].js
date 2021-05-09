import { useEffect, useState } from 'react';

const ShowOrder = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <h4>Your time has expired</h4>;
  }

  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      <h4>You have {timeLeft} seconds left to pay</h4>
      <button className="btn btn-primary">Pay</button>
    </div>
  );
};

ShowOrder.getInitialProps = async (context, client) => {
  const { id } = context.query;
  const { data } = await client.get(`/api/orders/${id}`);

  return { order: data };
};

export default ShowOrder;
