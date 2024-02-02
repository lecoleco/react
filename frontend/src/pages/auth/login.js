import { Box, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { Layout as AuthLayout } from 'src/layouts/auth';
import { paths } from 'src/settings/paths';
import { useTranslation } from 'react-i18next';
import { usePageView } from 'src/hooks/use-page-view';
import { LoginForm } from 'src/sections/auth/login-form';

import { AUTH_LOCALE } from 'src/locales/auth';
import { FORM_LOCALE } from 'src/locales/form';
import { ARROW_LEFT } from 'src/settings/icon-constants';

const Page = () => {
  const { t } = useTranslation();

  usePageView();

  return (
    <>
      <Seo title={t(AUTH_LOCALE.auth.seo)} />

      <Box sx={{ mb: 4 }}>
        <Link
          color="text.primary"
          component={RouterLink}
          href={paths.index}
          sx={{
            alignItems: 'center',
            display: 'inline-flex',
          }}
          underline="hover"
        >
          <SvgIcon sx={{ mr: 1 }}>{ARROW_LEFT}</SvgIcon>
          <Typography variant="subtitle2">{t(FORM_LOCALE.link.begin)}</Typography>
        </Link>
      </Box>

      <Stack
        sx={{ mb: 4 }}
        spacing={1}
      >
        <Typography variant="h5">{t(AUTH_LOCALE.auth.seo)}</Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {t(AUTH_LOCALE.login.title_4)} &nbsp;
          <Link
            href={paths.auth.register}
            underline="hover"
            variant="subtitle2"
          >
            {t(AUTH_LOCALE.login.link_1)}
          </Link>
        </Typography>
      </Stack>

      <LoginForm />
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
