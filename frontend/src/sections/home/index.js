import { Box, Container, Rating, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { HOME_LOCALE } from 'src/locales/home';
import { getLanguageImg } from 'src/helpers/get-language-img';

export const Home = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const imgHome = getLanguageImg(i18n.language);

  return (
    <Box
      sx={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        backgroundImage: 'url("/assets/gradient-bg.svg")',
        pt: '120px',
      }}
    >
      <Container maxWidth="lg">
        <Box maxWidth="md">
          <Typography
            variant="h1"
            sx={{ mb: 2 }}
          >
            {t(HOME_LOCALE.index.title_1)}&nbsp;
            <Typography
              component="span"
              color="primary.main"
              variant="inherit"
            >
              {t(HOME_LOCALE.index.title_2)}
            </Typography>
            {t(HOME_LOCALE.index.title_3)}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            {t(HOME_LOCALE.index.title_4)}
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            flexWrap="wrap"
            spacing={1}
            sx={{ my: 3 }}
          >
            <Rating
              readOnly
              value={4.9}
              precision={0.1}
              max={5}
            />
            <Typography
              color="text.primary"
              variant="caption"
              sx={{ fontWeight: 700 }}
            >
              4.9/5
            </Typography>
            <Typography
              color="text.secondary"
              variant="caption"
            >
              {t(HOME_LOCALE.index.reviews)}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            pt: '70px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              width: '100%',
              fontSize: 0,
              mt: -2, // hack to cut the bottom box shadow
              mx: -2,
              pt: 2,
              px: 2,
              '& img': {
                borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2.5,
                borderTopRightRadius: (theme) => theme.shape.borderRadius * 2.5,
                boxShadow: 16,
                width: '100%',
              },
            }}
          >
            <img src={imgHome[theme.palette.mode]} />
          </Box>

          <Box
            sx={{
              maxHeight: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              position: 'absolute',
              right: 0,
              top: 40,
              '& > div': {
                height: 460,
                width: 560,
              },
            }}
          ></Box>
        </Box>
      </Container>
    </Box>
  );
};
