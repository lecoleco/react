import { datetimeZone } from './datetime-zone';
import { v4 as uuidv4 } from 'uuid';

export const setIdTimeStamp = (params) => {
  const { isFather, payload, noCreateAt = false } = params;
  const isId = !payload.id || payload.id === '';
  const isCreateAt = !payload.createdAt || payload.createdAt === '';

  if (!isFather && isId) payload.id = uuidv4();

  if (isCreateAt && !noCreateAt) payload.createdAt = datetimeZone();

  payload.updatedAt = datetimeZone();
};
