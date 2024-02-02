import { deepCopy } from 'src/helpers/deep-copy';
import { logRegister } from './log-register';

export const searchContacts = (request = {}) => {
  const { query, contacts } = request;

  return new Promise((resolve, reject) => {
    try {
      let foundContacts = contacts.data;

      if (query) {
        const cleanQuery = query.toLowerCase().trim();
        foundContacts = foundContacts.filter((contact) => contact.accountDetail.name.toLowerCase().includes(cleanQuery));
      }

      resolve(deepCopy(foundContacts));
    } catch (error) {
      reject(logRegister(error));
    }
  });
};
