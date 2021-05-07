import useRequest from '../../hooks/use-request';

const ShowTicket = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => {
      console.log(order);
    }
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={doRequest} className="btn btn-primary">Purchase</button>
    </div>
  );
};

ShowTicket.getInitialProps = async (context, client) => {
  const { id } = context.query;
  const { data } = await client.get(`/api/tickets/${id}`);

  return { ticket: data };
};

export default ShowTicket;
