export const clearObj = (obj, excptions = '') => {
  const result = obj;
  Object.entries(result).forEach(([key, value]) => {
    if (!excptions.includes(key)) {
      if (typeof value === 'string') {
        result[key] = '';
      } else if (typeof value === 'number') {
        result[key] = 0;
      } else if (typeof value === 'boolean') {
        result[key] = false;
      }
    }
  });

  return result;
};
