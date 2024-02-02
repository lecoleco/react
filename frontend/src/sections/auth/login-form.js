import * as Yup from 'yup';
import { Box, Link, TextField, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useMounted } from 'src/hooks/use-mounted';
import { useCallback } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { clone } from 'lodash';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'src/hooks/use-search-params';
import { useRouter } from 'src/hooks/use-router';
import LoadingButton from '@mui/lab/LoadingButton';
import { serviceApi } from 'src/services/service-api';
import { logRegister } from 'src/helpers/log-register';
import { logRegisterByCode } from 'src/helpers/get-msg-error-by-code';
import { datetimeZone } from 'src/helpers/datetime-zone';

import { APP } from 'src/settings/config';
import { AUTH_LOCALE } from 'src/locales/auth';
import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { LOCK } from 'src/settings/icon-constants';
import { paths } from 'src/settings/paths';

const initialValues = {
  email: APP.EMAIL,
  password: APP.PASSWORD,
};

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const isMounted = useMounted();
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t(FORM_LOCALE.validation.email))
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
    password: Yup.string()
      .min(8, t(FORM_LOCALE.validation.min) + '8')
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
  });

  const loginEvent = useCallback(
    async () => {
      try {
        //TODO make a strategy to clean this table in periods.
        const response = await serviceApi.requestData(APP.LOGIN_EVENT_API, 'GET');

        if (isMounted) {
          const login = {
            city: response.city,
            country: response.country,
            countryCapital: response.country_capital,
            countryName: response.country_name,
            countryPopulation: response.country_population,
            ip: response.ip,
            latitude: response.latitude,
            longitude: response.longitude,
            org: response.org,
            postal: response.postal,
            region: response.region,
            regionCode: response.regionCode,
            timezone: response.timezone,
            utcOffset: response.utc_offset,
            detail: t(AUTH_LOCALE.login.register) + datetimeZone('CUSTOM', new Date(), APP.DATE_FORMAT_LONG2),
            userAgent: window.navigator.userAgent,
          };

          return login;
        }
      } catch (error) {
        logRegister('Can not register the login event - ' + error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted]
  );

  const submitForm = useCallback(
    async (values, helpers) => {
      try {
        values.login = await loginEvent();

        await signIn(clone(values));

        if (isMounted()) {
          router.push(returnTo || paths.admin.index);
          toast.success(t(FORM_LOCALE.common.hello));
        }
      } catch (error) {
        toast.error(t(logRegisterByCode(error)));
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      await submitForm(values, helpers);
    },
  });

  return (
    <form
      id="user-login"
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
      <Stack spacing={3}>
        <TextField
          autoFocus
          fullWidth
          error={!!(formik.touched.email && formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          label={t(FIELD_LOCALE.field.email)}
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="email"
          value={formik.values.email}
          inputProps={{ maxLength: 255 }}
        />

        <TextField
          fullWidth
          error={!!(formik.touched.password && formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          label={t(FIELD_LOCALE.field.password)}
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.password}
        />
      </Stack>

      <LoadingButton
        size="large"
        sx={{ mt: 3 }}
        fullWidth
        type="submit"
        loading={formik.isSubmitting}
        loadingPosition="start"
        variant="contained"
        startIcon={LOCK}
      >
        <span>{t(FORM_LOCALE.button.continue)}</span>
      </LoadingButton>

      <Box sx={{ mt: 3 }}>
        <Link
          href={paths.auth.forgotPassword}
          underline="hover"
          variant="subtitle2"
        >
          {t(AUTH_LOCALE.login.link_2)}
        </Link>
      </Box>
    </form>
  );
};
