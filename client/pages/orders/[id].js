const ShowOrder = ({ order }) => {
  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
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
