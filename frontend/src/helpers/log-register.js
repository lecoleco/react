const MSG_DEFAULT = ':( Desculpe, algo deu errado, vamos verificar!';

const prepareError = (errors) => {
  let msgError = '';

  if (errors) {
    if (Array.isArray(errors)) {
      errors.forEach((erro) => {
        msgError = msgError !== '' ? '\n' : '';
        msgError += `${erro}`;
      });
    } else if (errors.isAxiosError) {
      msgError = MSG_DEFAULT;
    } else {
      msgError = errors;
    }
  } else {
    msgError = MSG_DEFAULT;
  }

  return msgError;
};

export const logRegister = (error) => {
  let dataError = {};

  if (Object.prototype.hasOwnProperty.call(error, 'response') && typeof error.response !== 'undefined') {
    if (error.response.status === 307) {
      return error;
    } else if (typeof error.response.data !== 'undefined') {
      if (error.response.data.message) {
        dataError = error.response.data.message;
      } else if (error.response.statusText) {
        dataError = error.response.statusText;
      }
    } else if (error.response.errors) {
      dataError = error.response.errors;
    } else {
      dataError = error;
    }
  } else {
    dataError = error;
  }

  // TODO send email with related error
  console.log(dataError);

  return prepareError(dataError);
};
