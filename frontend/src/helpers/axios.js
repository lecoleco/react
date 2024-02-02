import axios from 'axios';
import { logRegister } from './log-register';
import { setTokenHeader, removeToken, whiteToken } from './local-store';
import { APP_NAME } from 'src/settings/config';

const axiosInstance = axios.create({
  headers: { accept: 'application/json', app: APP_NAME },
});

axiosInstance.interceptors.request.use(
  (request) => {
    //if came for access api external like CEP
    if (!request.withCredentials) {
      removeToken(false);
      delete request.headers.app;
    } else {
      setTokenHeader(request);
    }

    if (request.data && request.data.body && request.data.body.fileContent) {
      //make a file updload property.
      request.data = prepareParams(request.data);
    }

    return request;
  },
  (error) => Promise.reject(logRegister(error))
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    whiteToken(response.headers?.api_token);

    return response.data;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 307)) {
      removeToken();
      window.location = '/auth/login';
    }

    return Promise.reject(logRegister(error));
  }
);

const prepareParams = (data) => {
  const { params, settings, body } = data;

  if (body.fileContent.files && Object.keys(body.fileContent.files).length !== 0) {
    let formData = new FormData();

    formData.append('params', JSON.stringify(params));
    formData.append('settings', JSON.stringify(settings));
    formData.append('upload', body.fileContent.files);
    formData.append('formData', JSON.stringify(body));

    return formData;
  } else {
    delete body.fileContent;
  }

  return body;
};

export const removeTokenFromHeader = () => {
  delete axiosInstance.defaults.headers.Authorization;
};

export default axiosInstance;
