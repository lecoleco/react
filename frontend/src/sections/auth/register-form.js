import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Box, Checkbox, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/settings/paths';
import { useAuth } from 'src/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { FormatInput } from 'src/components/format-input';
import { toast } from 'react-hot-toast';
import { clone } from 'lodash';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMounted } from 'src/hooks/use-mounted';
import { useCallback } from 'react';

import { USER_LOCALE } from 'src/locales/user';
import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { AUTH_LOCALE } from 'src/locales/auth';
import { MESSAGE_SMILE } from 'src/settings/icon-constants';
import { logRegisterByCode } from 'src/helpers/get-msg-error-by-code';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  password: '',
  term: false,
};

export const RegisterForm = () => {
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const isMounted = useMounted();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .max(30, t(FORM_LOCALE.validation.max) + '30')
      .required(t(FORM_LOCALE.validation.required)),
    lastName: Yup.string()
      .max(30, t(FORM_LOCALE.validation.max) + '30')
      .required(t(FORM_LOCALE.validation.required)),
    email: Yup.string()
      .email(t(FORM_LOCALE.validation.email))
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
    telephone: Yup.string().required(t(FORM_LOCALE.validation.required)),
    password: Yup.string()
      .min(8, t(FORM_LOCALE.validation.min) + '8')
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
    term: Yup.boolean().oneOf([true], t(FORM_LOCALE.validation.required)),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      await submitForm(values, helpers);
    },
  });

  const submitForm = useCallback(
    async (values, helpers) => {
      try {
        const bodyEmail = t(USER_LOCALE.user.messageRegister);

        await signUp(clone(values), bodyEmail);

        if (isMounted()) {
          toast.success(t(AUTH_LOCALE.register.success));
          formik.resetForm();
        }
      } catch (error) {
        toast.error(t(logRegisterByCode(error)));
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik, isMounted]
  );

  return (
    <form
      id="user-register"
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
      <Stack spacing={3}>
        <TextField
          autoFocus
          error={!!(formik.touched.firstName && formik.errors.firstName)}
          fullWidth
          helperText={formik.touched.firstName && formik.errors.firstName}
          label={t(FIELD_LOCALE.field.firstName)}
          name="firstName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.firstName}
          inputProps={{ maxLength: 30 }}
        />

        <TextField
          error={!!(formik.touched.lastName && formik.errors.lastName)}
          fullWidth
          helperText={formik.touched.lastName && formik.errors.lastName}
          label={t(FIELD_LOCALE.field.lastName)}
          name="lastName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.lastName}
          inputProps={{ maxLength: 30 }}
        />

        <TextField
          error={!!(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label={t(FIELD_LOCALE.field.email)}
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.email}
          inputProps={{ maxLength: 255 }}
        />

        <TextField
          error={!!(formik.touched.telephone && formik.errors.telephone)}
          fullWidth
          helperText={formik.touched.telephone && formik.errors.telephone}
          label={t(FIELD_LOCALE.field.telephone)}
          name="telephone"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.telephone}
          InputProps={{
            inputComponent: FormatInput,
            type: 'telephone',
          }}
        />

        <TextField
          error={!!(formik.touched.password && formik.errors.password)}
          fullWidth
          helperText={formik.touched.password && formik.errors.password}
          label={t(FIELD_LOCALE.field.password)}
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.password}
        />
      </Stack>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          ml: -1,
          mt: 1,
        }}
      >
        <Checkbox
          checked={formik.values.term}
          name="term"
          onChange={formik.handleChange}
        />
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {t(FIELD_LOCALE.field.term)}{' '}
          <Link
            component={RouterLink}
            target="_blank"
            href={paths.auth.term}
          >
            {t(FORM_LOCALE.link.term)}
          </Link>
        </Typography>
      </Box>
      {!!(formik.touched.term && formik.errors.term) && <FormHelperText error>{formik.errors.term}</FormHelperText>}

      <LoadingButton
        size="large"
        sx={{ mt: 3 }}
        fullWidth
        type="submit"
        loading={formik.isSubmitting}
        loadingPosition="start"
        variant="contained"
        startIcon={MESSAGE_SMILE}
      >
        <span>{t(FORM_LOCALE.button.register)}</span>
      </LoadingButton>
    </form>
  );
};
