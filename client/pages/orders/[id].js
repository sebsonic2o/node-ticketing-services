import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const ShowOrder = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => {
      console.log(payment);
    }
  });

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
    return <h4>Your order has expired</h4>;
  }

  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      <h4>You have {timeLeft} seconds left to complete your order</h4>
      { errors }
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IntHXBOV9ei4s9pkgXEZPmYjzV1mW3MAcs76UmpOTieYP6uPMM8Xjk5HnQ3ZlntcCB3Zvy3AmfJeESvJ3HLHcXJ008yx2DRfr"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

ShowOrder.getInitialProps = async (context, client) => {
  const { id } = context.query;
  const { data } = await client.get(`/api/orders/${id}`);

  return { order: data };
};

export default ShowOrder;
