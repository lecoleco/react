import { removeTokenFromHeader } from './axios';

export const setTokenHeader = (request) => {
  if (!request.headers.Authorization) {
    const token = getToken();

    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  }
};

export const whiteToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  }
};

export const removeToken = (lStore = true) => {
  if (lStore) {
    localStorage.removeItem('activeRoomId');
    localStorage.removeItem('accessToken');
  }

  removeTokenFromHeader();
};

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const setStore = async (params) => {
  let { name, content } = params;

  if (name) {
    localStorage.setItem(name, content);
  }
};

export const getStore = (name) => {
  let result = false;

  if (name) {
    result = localStorage.getItem(name);

    if (!result) {
      result = false;
    }

    result = result === 'true' ? true : result;
    result = result === 'false' ? false : result;
  }
  return result;
};

export const removeStore = async (name) => {
  if (name) {
    localStorage.removeItem(name);
  }
};
