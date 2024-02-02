import { useContext } from 'react';
import { SocketContext } from 'src/contexts/socket';

export const useSocket = () => useContext(SocketContext);
