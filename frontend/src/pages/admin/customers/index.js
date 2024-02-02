import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { CustomerList } from 'src/sections/admin/customer/customer-list';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'src/hooks/use-settings';

import { CUSTOMER_LOCALE } from 'src/locales/customer';

const Page = () => {
  const { t } = useTranslation();
  const settings = useSettings();

  usePageView();

  return (
    <>
      <Seo title={t(CUSTOMER_LOCALE.customer.seo)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack spacing={3}>
            <CustomerList />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
