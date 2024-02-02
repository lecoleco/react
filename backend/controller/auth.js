import pkg from 'lodash';

import { StatusCodes } from '../helpers/http-code.js';
import { jwtSecrets } from '../helpers/jwt-secrets.js';
import { ErrorHandler } from '../helpers/error.js';
import { FormatResult } from '../helpers/format-result.js';
import { Notify } from '../helpers/notify.js';
import { make } from '../helpers/make.js';
import { ApiServices } from '../services/api.js';
import { getRemove } from '../helpers/get-remove.js';
import { getRandomInt } from '../helpers/get-random-int.js';
import { datetimeZone } from '../helpers/datetime-zone.js';
import LoginEventController from './login-event.js';
import PlanController from './plan.js';
import InvoiceController from './invoce.js';
import RuleController from './rule.js';
import { Mapping } from '../helpers/mapping.js';

import { ACCOUNT, CONNECTION, ROLE } from '../settings/constants.js';

const { isEmpty } = pkg;

const TABLE_TO_REMOVE = ['*.plans', '*.addresses', '*.billing', '*.teams'];
const ROTINE_NAME_USER_LOGIN_EVENT = 'user-login-event';
const ROTINE_NAME_USER_PLAN = 'user-plan';
const ROTINE_NAME_USER_INVOICE = 'user-invoice';

export default class AuthController {
  static login = async (req, res, next) => {
    try {
      let { params, body } = req.body;

      params = isEmpty(params) && !isEmpty(req.jwt) ? req.jwt : params;
      const rotine = req?.rotine;

      const query = {
        sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ email: params.email }, { password: params.password }] } }],
      };
      const resp = await ApiServices.findData({ rotine, payload: make.query({ rotine, body: query }), removeTargets: TABLE_TO_REMOVE });
      const result = await FormatResult.forSearch({ res: resp, rotine });

      if (!isEmpty(result.data.rule)) {
        const resultRule = await RuleController._findById({ ruleId: result.data.rule.id });
        result.data.rule = resultRule.success ? resultRule.data : {};
      }

      if (!result.success) {
        throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: ACCOUNT.NOT_VALID_EMAIL_PASSWORD });
      } else {
        if (!result.data.active) {
          throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: ACCOUNT.NOT_ACTIVE });
        } else if (!jwtSecrets.verify({ tokenOne: result.data.password, tokenTwo: params.password })) {
          throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: ACCOUNT.WRONG_PASSWORD });
        } else {
          if (isEmpty(req.jwt) || req.jwt.expired) {
            const token = jwtSecrets.dataToToken({ id: result.data.id, body: params, result });
            res.setHeader('api_token', token);
          }

          if (body) {
            body.accountId = result.data.id;
            // Dont need wait to write the login events
            const rotineUserLoginEvent = Mapping.getIndexInfo(ROTINE_NAME_USER_LOGIN_EVENT);
            LoginEventController._store({ rotine: rotineUserLoginEvent, body });
          }

          res.status(StatusCodes.OK).send(result);
        }
      }
    } catch (err) {
      next(err);
    }
  };

  static logout = async (_, res, next) => {
    try {
      res.status(StatusCodes.OK).send();
    } catch (err) {
      next(err);
    }
  };

  static verify = async (req, res, next) => {
    try {
      const jwt = jwtSecrets.tokenToData({ token: req.body.params.token });
      const rotine = req?.rotine;

      if (jwt.success) {
        const accountId = getRemove(jwt.data, 'id');
        const query = {
          sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ _id: accountId }] } }],
        };

        const respFind = await ApiServices.findData({ rotine, payload: make.query({ rotine, body: query, removeTargets: TABLE_TO_REMOVE }) });
        const result = await FormatResult.forSearch({ res: respFind, rotine });

        if (result.success) {
          if (result.data.verifyCode !== req.body.params.verifyCode) {
            if (result.data.verifyCode === ACCOUNT.CODE_ACTIVE) {
              throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: ACCOUNT.ACTIVATE_OK });
            }

            throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: ACCOUNT.NOT_ACTIVATE });
          }
          const isAdmin = result.data.firstName.toUpperCase() === 'ADMIN';

          //TODO write a plan for this user, this date have to came from lekys.com
          if (isAdmin) {
            const plans = [
              {
                id: '',
                type: 'startup',
                hours: 220,
                startDate: datetimeZone('CUSTOM', new Date('2023-06-01'), "yyyy-MM-dd'T'HH:mm:ss.SSxxx"),
                endDate: datetimeZone('CUSTOM', new Date('2023-12-31'), "yyyy-MM-dd'T'HH:mm:ss.SSxxx"),
                hourValue: 10.8,
                name: 'Development',
              },
              {
                id: '',
                type: 'standard',
                hours: 380,
                startDate: datetimeZone('CUSTOM', new Date('2024-01-01'), "yyyy-MM-dd'T'HH:mm:ss.SSxxx"),
                endDate: null,
                hourValue: 9,
                name: 'Maintenance x Support',
              },
              {
                id: '',
                type: 'business',
                hours: 0,
                startDate: null,
                endDate: null,
                hourValue: 0,
                name: 'Maintenance x Support x Improvements',
              },
            ];
            const rotineUserPlan = Mapping.getIndexInfo(ROTINE_NAME_USER_PLAN);
            PlanController._store({ rotine: rotineUserPlan, body: plans, params: { accountId } });

            const promises = [];
            const rotineUserInvoice = Mapping.getIndexInfo(ROTINE_NAME_USER_INVOICE);

            for (let index = 0; index < 15; index++) {
              const invoice = {
                accountId,
                dueDate: datetimeZone(),
                issueDate: datetimeZone(),
                number: getRandomInt(0, 12345),
                status: 'Duedate',
                amount: 5.8 + index - 1.5,
                totalAmount: 5.8 + index,
              };

              promises.push(await InvoiceController._store({ rotine: rotineUserInvoice, body: invoice }));
            }
            Promise.all(promises);
          }

          const body = isAdmin
            ? { active: true, role: ROLE.ADMINISTRATOR, verifyCode: ACCOUNT.CODE_ACTIVE }
            : { active: true, verifyCode: ACCOUNT.CODE_ACTIVE, role: ROLE.USER };

          const resp = await ApiServices.createORupdate({ rotine, body, id: accountId });
          const store = await FormatResult.forStore({ res: resp, rotine, body });

          if (store.success) {
            res.status(StatusCodes.OK).send(store);
          } else {
            throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: ACCOUNT.NOT_ACTIVATE });
          }
        } else {
          throw new ErrorHandler({ code: StatusCodes.NOT_FOUND, errors: ACCOUNT.NOT_FOUND });
        }
      } else {
        throw new ErrorHandler({ code: StatusCodes.UNAUTHORIZED, errors: CONNECTION.NEED_TOKEN });
      }
    } catch (err) {
      next(err);
    }
  };

  static forgotPassword = async (req, res, next) => {
    try {
      const { params } = req.body;
      const rotine = req?.rotine;

      const query = {
        sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ email: params.email }] } }],
      };

      const resp = await ApiServices.findData({ rotine, payload: make.query({ rotine, body: query, removeTargets: TABLE_TO_REMOVE }) });
      const result = await FormatResult.forSearch({ res: resp, rotine });

      if (!result.success) {
        throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: ACCOUNT.NOT_VALID_EMAIL });
      } else {
        if (!result.data.active) {
          throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: ACCOUNT.NOT_ACTIVE });
        } else {
          const password = Math.random().toString(36).substring(2, 10);

          const request = {
            password: jwtSecrets.dataToToken({ body: { password }, encry: true }),
            email: params.email,
            fullName: result.data.fullName,
          };

          const resp = await ApiServices.createORupdate({ rotine, body: request, id: result.data.id });

          if (resp && resp.result === 'updated') {
            request.password = password;

            await Notify.AccountForgotPassword({ hostname: req.headers.origin, body: request, rotine, bodyEmail: params.bodyEmail });

            res.status(StatusCodes.OK).send(result);
          }
        }
      }
    } catch (err) {
      next(err);
    }
  };

  static changePassword = async (req, res, next) => {
    try {
      const { params, body } = req.body;
      const rotine = req?.rotine;

      if (!(await ApiServices.idExists({ rotine, id: params.accountId }))) {
        throw new ErrorHandler({ code: StatusCodes.NOT_FOUND, errors: ACCOUNT.NOT_FOUND });
      }

      const resp = await ApiServices.createORupdate({ rotine, body, id: params.accountId, isUpdate: params?.update });
      const respById = await ApiServices.findId({ rotine, id: params.accountId, removeTargets: TABLE_TO_REMOVE });
      const result = await FormatResult.forSearch({ res: respById, rotine, resultStatus: resp.result });

      if (result.success) {
        const token = jwtSecrets.dataToToken({ body: result.data });
        res.setHeader('api_token', token);

        await Notify.AccountChangePassword({ hostname: req.headers.origin, body: result.data, bodyEmail: params?.bodyEmail });

        res.status(StatusCodes.OK).send(result);
      } else {
        throw new ErrorHandler({ code: StatusCodes.NOT_ACCEPTABLE, errors: ACCOUNT.NOT_CHANGE_PASSWORD });
      }
    } catch (err) {
      next(err);
    }
  };
}
