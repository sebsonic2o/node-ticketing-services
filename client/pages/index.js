const Home = ({ currentUser }) => {
  return <h1>{currentUser ? 'You are signed in' : 'You are NOT signed in'}</h1>;
};

Home.getInitialProps = async (context, client, currentUser) => {
  return {};
};

export default Home;
