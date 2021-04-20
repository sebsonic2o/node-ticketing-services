import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // from server
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
  } else {
    // from browser
    return axios.create({
      baseURL: '/'
    });
  }
};

export default buildClient;
