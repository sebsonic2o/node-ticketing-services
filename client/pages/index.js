import axios from 'axios';

const Home = ({ currentUser }) => {
  console.log(currentUser);

  return (
    <h1>Landing Page</h1>
  );
};

Home.getInitialProps = async ({ req }) => {
  let data = {};

  if (typeof window === 'undefined') {
    // from server
    ({ data } = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        headers: req.headers
      }
    ));
  } else {
    // from browser
    ({ data } = await axios.get('/api/users/currentuser'));
  }

  return data;
};

export default Home;
