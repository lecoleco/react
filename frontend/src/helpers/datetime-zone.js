import { endOfDay, formatDistanceToNow, differenceInSeconds, format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR as pt, es, enUS as en } from 'date-fns/locale';
import { getStore } from './local-store';

export const datetimeZone = (type = 'F', date = '', custom = '') => {
  const lng = getStore('i18nextLng') || 'en';
  const lngAdapter = lng === 'pt' ? pt : lng === 'es' ? es : en;
  let result = 0;

  switch (type) {
    case 'F':
      result = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSxxx");
      break;
    case 'DATE':
      result = date ? format(new Date(date), 'P', { locale: lngAdapter }) : format(new Date(), 'P', { locale: lngAdapter });
      break;
    case 'TIME':
      result = date ? format(new Date(date), 'HH:mm:ss') : format(new Date(), 'HH:mm:ss');
      break;
    case 'CUSTOM':
      result = date ? format(new Date(date), custom) : format(new Date(), custom); //"yyyy-MM-dd'T'HH:mm:ssxxx"
      break;
    case 'FROMNOW': //formatDistanceToNowStrict
      result = date
        ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: lngAdapter })
        : formatDistanceToNow(new Date(), { addSuffix: true, locale: lngAdapter });
      break;
    case 'ENDOF':
      result = date
        ? formatDistanceToNow(endOfDay(new Date(date)), { addSuffix: true, locale: lngAdapter })
        : formatDistanceToNow(endOfDay(new Date()), { addSuffix: true, locale: lngAdapter });
      break;
    case 'HOUR':
      result = date ? format(new Date(date), 'HH') : format(new Date(), 'HH');
      break;
    case 'MINUTES':
      result = date ? format(new Date(date), 'mm') : format(new Date(), 'mm');
      break;
    case 'SECONDS':
      result = date ? format(new Date(date), 'ss') : format(new Date(), 'ss');
      break;
    case 'MILLISECONDS':
      result = date ? format(new Date(date), 'SSS') : format(new Date(), 'SSS');
      break;
    case 'DURATION_SEC':
      result = date ? differenceInSeconds(new Date(), new Date(date)) : 0;
      break;
    default:
      result = 0;
  }

  return result;
};
