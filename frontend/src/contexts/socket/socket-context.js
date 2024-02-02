import { createContext } from 'react';

export const SocketContext = createContext({
  unSubscribe: () => Promise.resolve(),
  subscribe: () => Promise.resolve(),
  unRegisterSocket: () => Promise.resolve(),
  registerSocket: () => Promise.resolve(),
  isConnected: false,
});
