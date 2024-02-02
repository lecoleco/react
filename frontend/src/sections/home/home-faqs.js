import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HOME_LOCALE } from 'src/locales/home';

export const HomeFaqs = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ py: '120px' }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography
            align="center"
            color="inherit"
            variant="h3"
          >
            {t(HOME_LOCALE.faqs.title_1)}
          </Typography>
          <Typography
            align="center"
            color="inherit"
            variant="subtitle2"
          >
            {t(HOME_LOCALE.faqs.title_2)}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
