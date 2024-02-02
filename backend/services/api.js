import { StatusCodes } from '../helpers/http-code.js';
import { DbElastic } from '../database/elastic.js';
import { ErrorHandler } from '../helpers/error.js';

import { FormatResult } from '../helpers/format-result.js';
import { ValidationFeatures } from '../helpers/validation-features.js';
import { isCreated } from '../helpers/is-created.js';
import { pageConfigGet } from '../helpers/page-config-get.js';
import { pageConfigSet } from '../helpers/page-config-set.js';
import { FEATURES, CONNECTION } from '../settings/constants.js';

export class ApiServices {
  static createORupdate = async (params) => {
    const { rotine, id } = params;
    let { body } = params;

    try {
      const created = isCreated(body);

      body = ValidationFeatures.incFields(params);

      let response = null;

      if (id) {
        response = await DbElastic.connection.update({
          index: rotine.indexName,
          id,
          refresh: true,
          retry_on_conflict: 3,
          body,
        });
        response.result = created ? 'created' : body.script && body.script.source ? 'deleted' : response.result;
      } else {
        response = await DbElastic.connection.index({
          index: rotine.indexName,
          refresh: true,
          body,
        });
      }

      return response;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static updateByQuery = async (params) => {
    const { rotine, payload } = params;

    let success = true;
    let result = null;

    try {
      const response = await DbElastic.connection.updateByQuery({
        index: rotine.indexName,
        refresh: true,
        body: payload.query,
      });

      if (response) {
        if (response.updated > 0) {
          result = 'updated';
        } else if (response.deleted > 0) {
          result = 'deleted';
        } else if (response.noop > 0) {
          result = 'noop';
        } else {
          success = false;
        }
      } else {
        throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: FEATURES.DATA_NOT_UPDATE });
      }

      return { result, success };
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static remove = async (params) => {
    const { rotine, id } = params;

    try {
      const response = await DbElastic.connection.delete({
        index: rotine.indexName,
        refresh: true,
        id,
      });
      return response;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static removeByQuery = async (params) => {
    const { rotine, payload } = params;

    try {
      if (payload) {
        const response = await DbElastic.connection.deleteByQuery({
          index: rotine.indexName,
          body: payload,
        });
        return response;
      }
      throw CONNECTION.NEED_PARAMS;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static idExists = async (params) => {
    const { rotine, id } = params;

    try {
      if (id) {
        const response = await DbElastic.connection.exists({
          index: rotine.indexName,
          id,
        });

        return response;
      }
      return true;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static findId = async (params) => {
    const { rotine, id, removeTargets } = params;

    try {
      if (id) {
        const response = await DbElastic.connection.search({
          _source: removeTargets ? { excludes: removeTargets } : {},
          index: rotine.indexName,
          body: {
            query: {
              terms: {
                _id: [id],
              },
            },
          },
        });

        return response;
      }
      throw CONNECTION.NEED_PARAMS;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static findData = async (params) => {
    const { rotine, payload, removeTargets } = params;

    let response = null;

    try {
      if (payload) {
        const config = pageConfigGet(payload);

        if (config.success) {
          response = await DbElastic.connection.search({
            _source: removeTargets ? { excludes: removeTargets } : {},
            index: rotine.indexName,
            body: payload.query,
            from: config.fromRecord,
            size: config.pageSize,
          });

          pageConfigSet(response, config);
        } else {
          response = await DbElastic.connection.search({
            _source: removeTargets ? { excludes: removeTargets } : {},
            index: rotine.indexName,
            body: payload.query,
          });
        }

        return response;
      }
      throw CONNECTION.NEED_PARAMS;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static existDataKey = async (params) => {
    const { rotine, id, body } = params;

    try {
      if (id && body) {
        const resp = await ApiServices.findId({ rotine, id });

        if (resp) {
          const result = await FormatResult.forSearch({ res: resp, rotine, inArray: true });

          if (result) {
            const resultVld = ValidationFeatures.checkInArray({ result, body });

            resultVld.status = result.success ? 'update' : 'create';

            return resultVld;
          }
        }
      }
      return { success: true, status: null };
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };

  static count = async (params) => {
    const { rotine, payload } = params;

    try {
      if (payload) {
        const response = await DbElastic.connection.count({
          index: rotine.indexName,
          body: payload,
        });

        return response.count;
      }
      throw CONNECTION.NEED_PARAMS;
    } catch (err) {
      throw new ErrorHandler({ code: StatusCodes.BAD_REQUEST, errors: err });
    }
  };
}
