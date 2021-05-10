import Link from 'next/link';

const IndexOrder = ({ orders }) => {
  const orderList = orders.map((order) => {
    return (
      <tr key={order.id}>
        <td>
          <Link href="/tickets/[id]" as={`/tickets/${order.ticket.id}`}>
            <a>{order.ticket.title}</a>
          </Link>
        </td>
        <td>{order.status}</td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orderList}
        </tbody>
      </table>
    </div>
  );
};

IndexOrder.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default IndexOrder;
