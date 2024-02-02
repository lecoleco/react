import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { UserList } from 'src/sections/admin/user/user-list';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'src/hooks/use-settings';

import { USER_LOCALE } from 'src/locales/user';

const Page = () => {
  const { t } = useTranslation();
  const settings = useSettings();
  console.log(settings);
  usePageView();

  return (
    <>
      <Seo title={t(USER_LOCALE.user.seoList)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack spacing={3}>
            <UserList />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
