import { StatusCodes } from '../helpers/http-code.js';
import { jwtSecrets } from '../helpers/jwt-secrets.js';
import { ErrorHandler } from '../helpers/error.js';
import { ValidationFeatures } from '../helpers/validation-features.js';
import { storageFile } from '../helpers/storage-file.js';
import { ALLOWED_ORIGINS } from '../settings/config.js';
import { CONNECTION, ACCOUNT } from '../settings/constants.js';
import { Mapping } from '../helpers/mapping.js';
import { v4 as uuidv4 } from 'uuid';

export class ValidationMiddleware {
  static hasFilesUpload = (target) => {
    return (req, _, next) => {
      try {
        if (req.files) {
          const formData = JSON.parse(req.body.formData);
          const params = JSON.parse(req.body.params);
          const settings = JSON.parse(req.body.settings);

          const tagName = formData.fileContent.field;
          const folder = formData.fileContent.folder;
          const deleteFile = tagName === 'avatar' ? formData[tagName].split('/').pop() : null;

          const { upload } = req.files;
          const fileName = formData.fileContent.files.name
            ? uuidv4() + '.' + formData.fileContent.files.name.split('.').pop()
            : upload.name.split('.').shift() + '_' + uuidv4() + '.' + upload.name.split('.').pop();
          upload.name = fileName;

          if (target) {
            formData[target][tagName] = '/app_images/' + folder + '/' + fileName;
          } else {
            formData[tagName] = '/app_images/' + folder + '/' + fileName;
          }

          storageFile({ upload, deleteFile, folder });

          delete formData.fileContent;

          req.body = { params, settings, body: formData };
        }
        return next();
      } catch (err) {
        next(err);
      }
    };
  };

  static hasValidSchema = (settings) => {
    return (req, _, next) => {
      try {
        const { body, params } = req.body;
        let result = { valid: true };

        if (!params?.update) {
          settings.body = body;
          result = ValidationFeatures.schema(settings);
        }

        if (!result.valid) {
          throw new ErrorHandler({ code: StatusCodes.EXPECTATION_FAILED, errors: result.errors + ' - hasValidSchema' });
        } else {
          return next();
        }
      } catch (err) {
        next(err);
      }
    };
  };

  static rotine = (name) => {
    return (req, _, next) => {
      try {
        req.rotine = Mapping.getIndexInfo(name);

        return next();
      } catch (err) {
        next(err);
      }
    };
  };

  static hasKeys = (params) => {
    return (req, _, next) => {
      try {
        params.fields = Object.assign(req.body.params, req.body.body);

        const result = ValidationFeatures.fields(params);

        if (!result.valid) {
          throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: result.errors + ' - hasKeys' });
        } else {
          return next();
        }
      } catch (err) {
        next(err);
      }
    };
  };

  static validJWTNeeded = (req, res, next) => {
    try {
      if (req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ');
        const isAppFront = req.headers.origin && req.headers.origin.includes(ALLOWED_ORIGINS);

        if (authorization[0] !== 'Bearer') {
          throw new ErrorHandler({ code: StatusCodes.FORBIDDEN, errors: CONNECTION.EMPTY_TOKEN });
        } else {
          const jwt = jwtSecrets.tokenToData({ token: authorization[1] });
          if (!jwt.success) {
            if (jwt.expired) {
              if (!isAppFront) {
                throw new ErrorHandler({
                  code: StatusCodes.TEMPORARY_REDIRECT,
                  errors: CONNECTION.SESSION_EXPIRED,
                  log: false,
                });
              }
            } else {
              throw new ErrorHandler({ code: StatusCodes.UNAUTHORIZED, errors: CONNECTION.NEED_TOKEN });
            }
          }

          if (jwt.data) {
            req.jwt = jwt.data;
            req.jwt.expired = jwt.expired;
          }
          return next();
        }
      } else {
        throw new ErrorHandler({ code: StatusCodes.UNAUTHORIZED, errors: CONNECTION.NEED_TOKEN });
      }
    } catch (err) {
      next(err);
    }
  };

  static verifyChangePassword = (req, _, next) => {
    try {
      const { params } = req.body;

      if (params) {
        if (params.currentPassword !== req.jwt.password) {
          throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: CONNECTION.PASSWORD_NOT_VALID_TOKEN });
        }
        if (params.password !== params.passwordConfirmation) {
          throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: ACCOUNT.PASSWORDS_NOT_VALID });
        }

        return next();
      }
    } catch (err) {
      next(err);
    }
  };
}
