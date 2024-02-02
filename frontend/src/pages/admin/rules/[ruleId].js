import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { RuleForm } from 'src/sections/admin/rule/rule-form';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'src/hooks/use-settings';

import { RULE_LOCALE } from 'src/locales/rule';

const Page = () => {
  const { t } = useTranslation();
  const settings = useSettings();

  usePageView();

  return (
    <>
      <Seo title={t(RULE_LOCALE.rule.seo)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack spacing={3}>
            <RuleForm />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
