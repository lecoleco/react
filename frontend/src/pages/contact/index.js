import { Avatar, Box, Container, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { ContactForm } from 'src/sections/home/contact/contact-form';
import { useTranslation } from 'react-i18next';

import { paths } from 'src/settings/paths';
import { HOME_LOCALE } from 'src/locales/home';
import { FORM_LOCALE } from 'src/locales/form';
import { ARROW_LEFT, MAIL_CLOSE } from 'src/settings/icon-constants';

const Page = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t(HOME_LOCALE.contact.seo)} />

      <Box
        component="main"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(2, 1fr)',
            xs: 'repeat(1, 1fr)',
          },
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.200'),
            py: 8,
          }}
        >
          <Container
            maxWidth="md"
            sx={{ pl: { lg: 15 } }}
          >
            <Stack spacing={3}>
              <div>
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
              </div>
              <Typography variant="h3">{t(HOME_LOCALE.contact.seo)}</Typography>
            </Stack>

            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{
                mb: 6,
                mt: 8,
              }}
            >
              <Avatar
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
                variant="rounded"
              >
                <SvgIcon>{MAIL_CLOSE}</SvgIcon>
              </Avatar>
              <Typography variant="overline">{t(HOME_LOCALE.contact.title_2)}</Typography>
            </Stack>

            <Typography
              sx={{ mb: 3 }}
              variant="h1"
            >
              {t(HOME_LOCALE.contact.title_3)}
            </Typography>
            <Typography
              sx={{ mb: 3 }}
              variant="body1"
            >
              {t(HOME_LOCALE.contact.title_4)}
            </Typography>
            <Typography
              color="primary"
              sx={{ mb: 3 }}
              variant="h6"
            >
              {t(HOME_LOCALE.contact.title_5)}
            </Typography>
          </Container>
        </Box>

        <Box
          sx={{
            backgroundColor: 'background.paper',
            px: 6,
            py: 15,
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              pr: {
                lg: 15,
              },
            }}
          >
            <Typography
              sx={{ pb: 3 }}
              variant="h6"
            >
              {t(HOME_LOCALE.contact.title_6)}
            </Typography>

            <ContactForm />
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Page;
