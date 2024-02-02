import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useCallback, useEffect } from 'react';

import { OtpInput } from 'src/components/otp-Input';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/use-auth';
import { toast } from 'react-hot-toast';

import { useMounted } from 'src/hooks/use-mounted';
import { useRouter } from 'src/hooks/use-router';
import LoadingButton from '@mui/lab/LoadingButton';

import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { AUTH_LOCALE } from 'src/locales/auth';
import { paths } from 'src/settings/paths';
import { USER_CHECK } from 'src/settings/icon-constants';
import { logRegisterByCode } from 'src/helpers/get-msg-error-by-code';
import { useUrlParam } from 'src/hooks/use-url-param';

const initialValues = {
  verifyCode: '',
};

export const VerifyCodeForm = () => {
  const { verify } = useAuth();
  const { t } = useTranslation();
  const isMounted = useMounted();
  const router = useRouter();

  const token = useUrlParam('token');

  const validationSchema = Yup.object({
    verifyCode: Yup.string().required(t(FORM_LOCALE.validation.required)),
  });

  const submitForm = useCallback(
    async (values, helpers) => {
      try {
        if (token) {
          await verify({ verifyCode: values.verifyCode, token });

          if (isMounted()) {
            router.push(paths.admin.index);
            toast.success(t(AUTH_LOCALE.verifyCode.success));
          }
        } else {
          toast.error(t(AUTH_LOCALE.verifyCode.errorToken));
        }
      } catch (error) {
        toast.error(t(logRegisterByCode(error)));
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted, token]
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
      id="user-verify"
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
      <FormControl error={!!(formik.touched.verifyCode && formik.errors.verifyCode)}>
        <FormLabel
          sx={{
            display: 'block',
            mb: 2,
          }}
        >
          {t(FIELD_LOCALE.field.verifyCode)}
        </FormLabel>

        <OtpInput
          autoFocus
          length={6}
          onBlur={() => formik.handleBlur('verifyCode')}
          onChange={(value) => formik.setFieldValue('verifyCode', value)}
          sx={{
            '& .MuiFilledInput-input': {
              p: '14px',
            },
          }}
          value={formik.values.verifyCode}
        />
        {!!(formik.touched.verifyCode && formik.errors.verifyCode) && <FormHelperText>{formik.touched.verifyCode && formik.errors.verifyCode}</FormHelperText>}
      </FormControl>

      <LoadingButton
        size="large"
        sx={{ mt: 3 }}
        fullWidth
        type="submit"
        loading={formik.isSubmitting}
        loadingPosition="start"
        variant="contained"
        startIcon={USER_CHECK}
      >
        <span>{t(FORM_LOCALE.button.verify)}</span>
      </LoadingButton>
    </form>
  );
};
