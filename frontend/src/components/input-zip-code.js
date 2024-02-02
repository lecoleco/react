import { useState, useCallback } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

import { FormatInput } from 'src/components/format-input';
import { useMounted } from 'src/hooks/use-mounted';
import { serviceApi } from 'src/services/service-api';
import { formatMask } from 'src/helpers/format-mask';
import { useTranslation } from 'react-i18next';
import { Permissions } from './permissions';

import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { STATE_BR, STATE_US, RULE_TYPES } from 'src/settings/constants';
import { APP } from 'src/settings/config';

const STATES = APP.COUNTRY === 'br' ? STATE_BR : STATE_US;

export const InputZipCode = (props) => {
  const { formik, ...other } = props;
  const [loading, setloading] = useState(false);
  const isMounted = useMounted();
  const { t } = useTranslation();
  const [oldValues, setOldValues] = useState();

  const validZipcode = useCallback(
    (data) => {
      const validation = /^[0-9]{8}$/;

      let result = true;

      if (data === '') {
        result = false;
      } else if (!validation.test(data)) {
        toast.error(t(FORM_LOCALE.validation.zipcode));
        result = false;
      }

      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const validationHandleBlurZipcode = useCallback(
    (event) => {
      if (event.target.value === '') {
        formik.resetForm();
      } else if (event.target.value !== formik.values.zipcode) {
        const zipcode = formatMask(event.target.value);

        if (validZipcode(zipcode)) {
          (async () => {
            try {
              setloading(true);

              if (oldValues && formatMask(oldValues.zipcode) === event.target.value) {
                formik.setValues(oldValues);
              } else {
                const dataZipcode = await serviceApi.requestData(`https://viacep.com.br/ws/${zipcode}/json/`, 'GET');

                if (isMounted()) {
                  if ('erro' in dataZipcode) {
                    formik.resetForm();

                    toast.error(t(FORM_LOCALE.common.notFound));
                    setloading(false);
                  } else {
                    formik.setFieldValue('zipcode', dataZipcode.cep);
                    formik.setFieldValue('address', dataZipcode.logradouro);
                    formik.setFieldValue('city', dataZipcode.localidade);
                    formik.setFieldValue('state', dataREGION.name);
                  }
                }
                setOldValues(formik.values);
              }
              setloading(false);
            } catch (error) {
              toast.error(error);
              setloading(false);
            }
          })();
        } else {
          formik.resetForm();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik]
  );

  return (
    <>
      <Permissions
        routine={other.routine}
        feature={other.name}
        type={RULE_TYPES.FIELD}
      >
        <TextField
          {...other}
          error={!!(formik.touched.zipcode && formik.errors.zipcode)}
          helperText={formik.touched.zipcode && formik.errors.zipcode}
          fullWidth
          required
          label={t(FIELD_LOCALE.field.zipcode)}
          name="zipcode"
          disabled={loading}
          onBlur={validationHandleBlurZipcode}
          value={formik.values.zipcode}
          autoFocus
          InputProps={{
            inputComponent: FormatInput,
            type: 'zipcode',
            endAdornment: (
              <>
                {' '}
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                  />
                ) : null}{' '}
              </>
            ),
          }}
        />
      </Permissions>
    </>
  );
};

InputZipCode.propTypes = {
  formik: PropTypes.any.isRequired,
};
