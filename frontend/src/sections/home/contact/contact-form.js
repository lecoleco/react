import * as Yup from 'yup';
import { Box, Link, TextField, Typography, Stack, SvgIcon, Unstable_Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RouterLink } from 'src/components/router-link';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import { useCallback, useState } from 'react';
import { FormatInput } from 'src/components/format-input';
import { toast } from 'react-hot-toast';
import { useFormik } from 'formik';
import { useMounted } from 'src/hooks/use-mounted';
import { serviceApi } from 'src/services/service-api';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { isEmpty } from 'lodash';
import { datetimeZone } from 'src/helpers/datetime-zone';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import { paths } from 'src/settings/paths';
import { HOME_LOCALE } from 'src/locales/home';
import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { logRegisterByCode } from 'src/helpers/get-msg-error-by-code';

const useContactStore = () => {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const [isLoading, setLoading] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const initialValues = { fullName: '', company: '', email: '', telephone: '', message: '' };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
    company: Yup.string()
      .max(100, t(FORM_LOCALE.validation.max) + '100')
      .required(t(FORM_LOCALE.validation.required)),
    email: Yup.string()
      .email(t(FORM_LOCALE.validation.email))
      .max(255, t(FORM_LOCALE.validation.max) + '255')
      .required(t(FORM_LOCALE.validation.required)),
    telephone: Yup.string().required(t(FORM_LOCALE.validation.required)),
    message: Yup.string().max(500, t(FORM_LOCALE.validation.max) + '500'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      await submitForm(values, helpers);
    },
  });

  const submitForm = async (values, helpers) => {
    try {
      const requestParam = {
        params: { contactId },
        body: values,
        settings: {},
      };

      const response = await serviceApi.requestData('contact/store', 'POST', requestParam);

      if (isMounted()) {
        if (response.success) {
          setContactId(response.data.id);
          toast.success(t(HOME_LOCALE.contact.success));
        }
      }
    } catch (error) {
      toast.error(t(logRegisterByCode(error)));
      helpers.setStatus({ success: false });
      helpers.setSubmitting(false);
    }
  };

  const getContact = useCallback(async (values) => {
    try {
      if (!isEmpty(values.telephone) && !isEmpty(values.email)) {
        setLoading(true);

        const requestParam = {
          settings: {
            sources: [
              {
                source: 'bool|must',
                filter: { type: 'term', fields: [{ telephone: values.telephone }, { email: values.email }] },
              },
            ],
            config: { contact: { currentPage: 0, pageSize: 10 } },
            orders: [{ field: 'createdAt', type: 'desc' }],
          },
        };
        const response = await serviceApi.requestData('contact/find', 'POST', requestParam);
        if (isMounted()) {
          if (response.success) {
            setContactId(response.data[0].id);
            setUpdatedAt(response.data[0].updatedAt);
            formik.setFieldValue('message', response.data[0].message);
          }
          setLoading(false);
        }
      }
    } catch (error) {
      toast.error(t(logRegisterByCode(error)));
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    updatedAt,
    getContact,
    formik,
  };
};

export const ContactForm = () => {
  const { t } = useTranslation();
  const contactStore = useContactStore();

  return (
    <LoadingDisabled loading={contactStore.isLoading}>
      <form
        id="contact"
        autoComplete="off"
        onSubmit={contactStore.formik.handleSubmit}
      >
        <Grid
          container
          spacing={3}
        >
          <Grid
            xs={12}
            sm={6}
          >
            <TextField
              error={!!(contactStore.formik.touched.fullName && contactStore.formik.errors.fullName)}
              fullWidth
              helperText={contactStore.formik.touched.fullName && contactStore.formik.errors.fullName}
              label={t(FIELD_LOCALE.field.fullName)}
              name="fullName"
              onBlur={contactStore.formik.handleBlur}
              onChange={contactStore.formik.handleChange}
              value={contactStore.formik.values.fullName}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>

          <Grid
            xs={12}
            sm={6}
          >
            <TextField
              error={!!(contactStore.formik.touched.company && contactStore.formik.errors.company)}
              fullWidth
              helperText={contactStore.formik.touched.company && contactStore.formik.errors.company}
              label={t(FIELD_LOCALE.field.company)}
              name="company"
              onBlur={contactStore.formik.handleBlur}
              onChange={contactStore.formik.handleChange}
              value={contactStore.formik.values.company}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid
            xs={12}
            sm={6}
          >
            <TextField
              error={!!(contactStore.formik.touched.email && contactStore.formik.errors.email)}
              fullWidth
              helperText={contactStore.formik.touched.email && contactStore.formik.errors.email}
              label={t(FIELD_LOCALE.field.email)}
              name="email"
              onBlur={contactStore.formik.handleBlur}
              onChange={contactStore.formik.handleChange}
              value={contactStore.formik.values.email}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>

          <Grid
            xs={12}
            sm={6}
          >
            <TextField
              error={!!(contactStore.formik.touched.telephone && contactStore.formik.errors.telephone)}
              fullWidth
              helperText={contactStore.formik.touched.telephone && contactStore.formik.errors.telephone}
              label={t(FIELD_LOCALE.field.telephone)}
              name="telephone"
              onBlur={() => contactStore.getContact(contactStore.formik.values)}
              onChange={contactStore.formik.handleChange}
              value={contactStore.formik.values.telephone}
              InputProps={{
                inputComponent: FormatInput,
                type: 'telephone',
              }}
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              error={!!(contactStore.formik.touched.message && contactStore.formik.errors.message)}
              fullWidth
              helperText={contactStore.formik.touched.message && contactStore.formik.errors.message}
              label={t(FIELD_LOCALE.field.message)}
              name="message"
              onBlur={contactStore.formik.handleBlur}
              onChange={contactStore.formik.handleChange}
              value={contactStore.formik.values.message}
              inputProps={{ maxLength: 5000 }}
              multiline
              rows={6}
            />
          </Grid>
        </Grid>

        {contactStore.updatedAt && (
          <Stack>
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{ mt: 1 }}
            >
              <SvgIcon color="action">
                <CalendarIcon />
              </SvgIcon>
              <Typography variant="body2">{datetimeZone('FROMNOW', contactStore.updatedAt)}</Typography>
            </Stack>
          </Stack>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
          }}
        >
          <LoadingButton
            fullWidth
            type="submit"
            loading={contactStore.formik.isSubmitting}
            loadingPosition="start"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            <span>{t(FORM_LOCALE.button.send)}</span>
          </LoadingButton>
        </Box>

        <Typography
          color="text.secondary"
          sx={{ mt: 3 }}
          variant="body2"
        >
          {t(HOME_LOCALE.contact.footer_1)}{' '}
          <Link
            color="text.primary"
            component={RouterLink}
            target="_blank"
            href={paths.auth.term}
            underline="always"
            variant="subtitle2"
          >
            {t(HOME_LOCALE.contact.term)}
          </Link>
          {', '}
          <Link
            color="text.primary"
            component={RouterLink}
            target="_blank"
            href={paths.auth.privacy}
            underline="always"
            variant="subtitle2"
          >
            {t(HOME_LOCALE.contact.privacy)}
          </Link>{' '}
          {t(HOME_LOCALE.contact.footer_2)}{' '}
          <Link
            color="text.primary"
            component={RouterLink}
            target="_blank"
            href={paths.auth.cookie}
            underline="always"
            variant="subtitle2"
          >
            {t(HOME_LOCALE.contact.cookies)}
          </Link>
          .
        </Typography>
      </form>
    </LoadingDisabled>
  );
};
