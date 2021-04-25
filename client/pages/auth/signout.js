import Router from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';

const SignOut = () => {
  const { doRequest, errors } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => {
      Router.push('/');
    }
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing out...</div>;
};

export default SignOut;