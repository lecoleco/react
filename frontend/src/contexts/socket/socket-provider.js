import mqtt from 'mqtt';
import { useCallback, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { thunks as notificationTrunks } from 'src/thunks/notification';
import { thunks as chatTrunks } from 'src/thunks/chat';
import { logRegister } from 'src/helpers/log-register';
import { useDispatch } from 'src/store';
import { SocketContext } from './socket-context';

import { MQTT_WORKER } from 'src/settings/config';
import { NOTIFICATION } from 'src/settings/constants';

export const SocketProvider = (props) => {
  const { children } = props;
  const [client, setClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const dispatch = useDispatch();

  const registerSocket = useCallback(
    async (user) => {
      if (user) {
        const userId = user.id;
        const clientId = 'MQTT_WEB_LEKYS_APP_' + userId + '_' + Math.random().toString(16).substring(2, 8);

        const options = {
          //log: console.log.bind(console),
          username: MQTT_WORKER.USERNAME,
          password: MQTT_WORKER.PASSWORD,
          clientId,
          protocolId: MQTT_WORKER.PROTOCOLID,
          protocolVersion: MQTT_WORKER.PROTOCOLVERSION,
          clean: MQTT_WORKER.CLEAN,
          reconnectPeriod: MQTT_WORKER.RECONNECTPERIOD,
          connectTimeout: MQTT_WORKER.CONNECTION_TIMEOUT,
          keepalive: MQTT_WORKER.KEEPALIVE,
          will: MQTT_WORKER.WILL,
          rejectUnauthorized: MQTT_WORKER.REJECT_UNAUTHORIZED,
        };

        setUserId(userId);
        setClient(mqtt.connect(MQTT_WORKER.HOST, options));
      } else {
        logRegister('MQTT web error on register client');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const unRegisterSocket = useCallback(
    async () => {
      if (client) {
        client.end(false);
      }
      setClient(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  const subscribe = useCallback(
    async (topic) => {
      if (client) {
        const options = { qos: MQTT_WORKER.QOS_1, retain: MQTT_WORKER.RETAIN };

        client.subscribe(topic, options, (error) => {
          if (error) {
            logRegister('MQTT web subscribe erro - [' + topic + '] - ' + error.toString());
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  const unSubscribe = useCallback(
    async (topic) => {
      if (client) {
        client.unsubscribe(topic);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  const isConnected = useMemo(() => {
    return client?.connected || false;
  }, [client?.connected]);

  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        // logRegister('MQTT web connect [' + clientId + ']');

        const options = { qos: MQTT_WORKER.QOS_1, retain: MQTT_WORKER.RETAIN };

        client.subscribe(userId, options, (error) => {
          if (error) {
            logRegister('MQTT web when subscribing [' + userId + '] - ' + error.toString());
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const body = JSON.parse(message.toString());

          // console.log('******** notification *********', body.sendFrom);

          if (body.sendFrom === NOTIFICATION.CHAT_APP) {
            dispatch(chatTrunks.setRoomNotify({ id: body.roomId, scrollStatus: 3 }));
          }

          if (body.sendFrom === NOTIFICATION.NOTIFICATION_APP) {
            dispatch(notificationTrunks.getNotificationNotRead({ to: topic, currentPage: 0 }));
          }
        } catch (error) {
          logRegister('MQTT web when receiving message - ' + error.toString());
        }
      });

      client.on('error', (error) => {
        logRegister('MQTT web error - ' + error.toString());
      });

      // client.on('close', () => {
      //   logRegister('MQTT web close');
      // })

      // client.on("disconnect", () => {
      //   logRegister('MQTT web disconnect');
      // });

      // client.on('reconnect', () => {
      //   logRegister('MQTT web reconnect');
      // });

      // client.on("offline", () => {
      //   logRegister('MQTT web offline');
      // });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, userId]);

  return (
    <SocketContext.Provider
      value={{
        ...client,
        registerSocket,
        unRegisterSocket,
        subscribe,
        unSubscribe,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
