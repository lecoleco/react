import axios from 'src/helpers/axios';
import { logRegister } from 'src/helpers/log-register';
import { APP } from 'src/settings/config';

class ServiceApi {
  requestData = async (api, met, params = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const externalAPI = api.substring(0, 5) === 'https';

        // retira token para API externa.
        const options = {
          method: met, // GET/POST/PUT/DELETE
          url: externalAPI ? api : APP.HOST + APP.API + api,
          withCredentials: !externalAPI,
          json: true,
        };

        if (met === 'GET') {
          options.params = params;
        } else {
          options.data = params;
        }

        axios(options)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(new Error(logRegister(error)));
      }
    });
  };
}

export const serviceApi = new ServiceApi();
