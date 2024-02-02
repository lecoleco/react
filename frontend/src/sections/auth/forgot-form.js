import * as Yup from 'yup';
import { useFormik } from 'formik';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/use-auth';
import { toast } from 'react-hot-toast';
import { useMounted } from 'src/hooks/use-mounted';
import LoadingButton from '@mui/lab/LoadingButton';
import { useCallback } from 'react';

import { USER_LOCALE } from 'src/locales/user';
import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { AUTH_LOCALE } from 'src/locales/auth';
import { ERASER } from 'src/settings/icon-constants';
import { logRegisterByCode } from 'src/helpers/get-msg-error-by-code';

const initialValues = {
  email: '',
};

export const ForgotForm = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const isMounted = useMounted();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t(FORM_LOCALE.validation.email))
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
  });

  const submitForm = useCallback(
    async (values, helpers) => {
      try {
        const bodyEmail = t(USER_LOCALE.user.messageForgotPassword);

        await forgotPassword(values, bodyEmail);

        if (isMounted()) {
          toast.success(t(AUTH_LOCALE.forgot.success));
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
      id="user-forgot"
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
      <TextField
        autoFocus
        error={!!(formik.touched.email && formik.errors.email)}
        fullWidth
        helperText={formik.touched.email && formik.errors.email}
        label={t(FIELD_LOCALE.field.email)}
        name="email"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="email"
        value={formik.values.email}
      />
      <LoadingButton
        size="large"
        sx={{ mt: 3 }}
        fullWidth
        type="submit"
        loading={formik.isSubmitting}
        loadingPosition="start"
        variant="contained"
        startIcon={ERASER}
      >
        <span> {t(FORM_LOCALE.button.reset)}</span>
      </LoadingButton>
    </form>
  );
};
