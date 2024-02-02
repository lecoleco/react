export const objectsEqual = (params) => {
  const { origem, destino } = params;
  let isValid = true;
  for (const key of Object.keys(origem)) {
    if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
      isValid = origem[key] === destino[key];
    }
    if (!isValid) {
      break;
    }
  }
  return isValid;
};
