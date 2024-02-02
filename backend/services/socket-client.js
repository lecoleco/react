import mqtt from 'mqtt';
import { StatusCodes } from '../helpers/http-code.js';
import { MQTT_WORKER } from '../settings/config.js';
import { ErrorHandler } from '../helpers/error.js';
import { jwtSecrets } from '../helpers/jwt-secrets.js';
import { Logs } from '../helpers/logs.js';

let CLIENT = null;

export class SocketClientServices {
  static registerSocket = async () => {
    Logs.logInfo('Start MQTT CLIENT...');
    Logs.logInfo('--------------------------------------------------');

    const clientId = 'MQTT_BACKEND_LEKYS_APP_' + Math.random().toString(16).substring(2, 8);

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

    CLIENT = mqtt.connect(MQTT_WORKER.HOST, options);

    CLIENT.on('connect', () => {
      Logs.logInfo('MQTT CLIENT connected - [' + clientId + ']');
    });

    CLIENT.on('error', (error) => {
      Logs.logInfo('MQTT CLIENT error - [' + clientId + '] - ' + error.toString());
      CLIENT.end();
      new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: 'MQTT CLIENT error - ' + error.toString() });
    });

    CLIENT.on('close', () => {
      Logs.logInfo('MQTT CLIENT close - [' + clientId + ']');
    });

    CLIENT.on('disconnect', () => {
      Logs.logInfo('MQTT CLIENT disconnect - [' + clientId + ']');
    });

    CLIENT.on('reconnect', () => {
      Logs.logInfo('MQTT CLIENT reconnect - [' + clientId + ']');
    });

    CLIENT.on('offline', () => {
      Logs.logInfo('MQTT CLIENT offline - [' + clientId + ']');
    });
  };

  static unRegisterSocket = async () => {
    if (CLIENT) {
      CLIENT.end(false);
      Logs.logInfo('MQTT CLIENT close');
    }
    CLIENT = null;
  };

  static send = async (params) => {
    const { from, to, roomId, sendFrom, message } = params;
    let success = false;

    try {
      if (CLIENT && CLIENT.connected) {
        success = true;

        const messageOBJString = JSON.stringify({
          from,
          roomId,
          sendFrom,
          message: message ? jwtSecrets.dataToToken({ body: message, encry: true }) : '',
        });

        const options = { qos: MQTT_WORKER.QOS_1, retain: MQTT_WORKER.RETAIN };

        CLIENT.publish(to, messageOBJString, options, (err) => {
          if (err) {
            Logs.logInfo('MQTT CLIENT error publish');
          }
        });
      } else {
        new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: 'MQTT CLIENT publish not connected' });
      }
    } catch (error) {
      new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: 'MQTT CLIENT publish error - ' + error.message });
    }
    return success;
  };

  static isConnected = async () => CLIENT.connected;
}
