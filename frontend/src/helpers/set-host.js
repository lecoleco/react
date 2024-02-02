import { APP } from 'src/settings/config';

export const setHost = (src = '') => (src = src ? APP.HOST.concat(src) : '');
