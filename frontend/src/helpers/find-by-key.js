export const findByKey = (data, value, key, label) => {
  let result = null;

  if (data) {
    const country = data.find((x) => x[key] === value);

    if (country) {
      result = country[label];
    }
  }

  return result;
};
