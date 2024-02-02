import { StatusCodes } from '../helpers/http-code.js';
import { ErrorHandler } from '../helpers/error.js';
import { ROLE } from '../settings/constants.js';
import { PERMISSION } from '../settings/constants.js';

export class PermissionMiddleware {
  static permissionlRequired = (req, _, next) => {
    try {
      const role = req.jwt?.role;

      if (role && Object.keys(ROLE).includes(role.toUpperCase())) {
        return next();
      }

      throw new ErrorHandler({ code: StatusCodes.FORBIDDEN, errors: PERMISSION.NOT_ALLOWED });
    } catch (err) {
      next(err);
    }
  };

  static onlyAccountOrAdminCanDoThisAction = (req, _, next) => {
    try {
      const { accountId } = req.body.params;

      const role = req.jwt.role;

      if (accountId && req.jwt.id === accountId) {
        return next();
      }

      if (role === ROLE.ADMINISTRATOR) {
        return next();
      }

      throw new ErrorHandler({ code: StatusCodes.FORBIDDEN, errors: PERMISSION.ONLY_ACCOUNT_ADMIN });
    } catch (err) {
      next(err);
    }
  };

  static onlyAdminCanDoThisAction = (req, _, next) => {
    try {
      const role = req.jwt.role;

      if (role === ROLE.ADMINISTRATOR) {
        return next();
      }
      throw new ErrorHandler({ code: StatusCodes.FORBIDDEN, errors: PERMISSION.ONLY_ADMIN });
    } catch (err) {
      next(err);
    }
  };
}
