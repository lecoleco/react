import jwt from 'jsonwebtoken';
import { JWT_SECRET_ENCRY } from 'src/settings/config';

class JwtSecrets {
  dataToToken = (data) => {
    return jwt.sign(data, JWT_SECRET_ENCRY, { noTimestamp: true });
  };

  tokenToData = (token) => {
    return jwt.verify(token, JWT_SECRET_ENCRY);
  };
}

export const jwtSecrets = new JwtSecrets();
