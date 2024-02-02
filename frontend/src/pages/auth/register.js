import { Box, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { Layout as AuthLayout } from 'src/layouts/auth';
import { paths } from 'src/settings/paths';
import { GuestGuard } from 'src/guards/guest-guard';
import { usePageView } from 'src/hooks/use-page-view';
import { useTranslation } from 'react-i18next';

import { FORM_LOCALE } from 'src/locales/form';
import { AUTH_LOCALE } from 'src/locales/auth';
import { RegisterForm } from 'src/sections/auth/register-form';
import { ARROW_LEFT } from 'src/settings/icon-constants';

const Page = () => {
  const { t } = useTranslation();

  usePageView();

  return (
    <>
      <Seo title={t(AUTH_LOCALE.register.seo)} />

      <div>
        <Box sx={{ mb: 4 }}>
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.auth.login}
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
          <Typography variant="h5">{t(AUTH_LOCALE.register.seo)}</Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {t(AUTH_LOCALE.register.title_1)} &nbsp;
            <Link
              href={paths.auth.login}
              underline="hover"
              variant="subtitle2"
            >
              {t(AUTH_LOCALE.register.link_1)}
            </Link>
          </Typography>
        </Stack>

        <RegisterForm />
      </div>
    </>
  );
};

Page.getLayout = (page) => (
  <GuestGuard>
    <AuthLayout>{page}</AuthLayout>
  </GuestGuard>
);

export default Page;
