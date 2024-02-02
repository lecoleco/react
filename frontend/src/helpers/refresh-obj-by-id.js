export const refreshObjById = (type, destinos, origens) => {
  let result = {};

  if (type === 'store') {
    const index = destinos.findIndex((destino) => destino.id === origens.id);

    if (index === -1) {
      //result = () => [...destinos, origens];
      result = [...destinos, origens];
    } else {
      result = destinos;
      result[index] = origens;
    }
  } else if (type === 'delete') {
    result = destinos.filter((destino) => !origens.find((origem) => origem.id === destino.id));
  }

  return result;
};
