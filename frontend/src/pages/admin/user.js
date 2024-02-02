import { useCallback, useState } from 'react';
import { Box, Container, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'src/hooks/use-search-params';
import { useEffect } from 'react';
import { hasPermission } from 'src/helpers/has-permission';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { UserBillingForm } from 'src/sections/admin/user/user-billing-form';
import { UserForm } from 'src/sections/admin/user/user-form';
import { UserAddressForm } from 'src/sections/admin/user/user-address-form';
import { UserTeamSettings } from 'src/sections/admin/user/user-team-settings';
import { UserSecuritySettings } from 'src/sections/admin/user/user-security-settings';
import { useRouter } from 'src/hooks/use-router';
import { useAuth } from 'src/hooks/use-auth';
import { useSettings } from 'src/hooks/use-settings';

import { USER_LOCALE } from 'src/locales/user';
import { RULE_TYPES } from 'src/settings/constants';
import { paths } from 'src/settings/paths';

const TAB_GENERAL = 'general';
const TAB_ADDRESS = 'address';
const TAB_TEAM = 'team';
const TAB_BILLING = 'billing';
const TAB_SECURITY = 'security';

const useUsersStore = (userTabs) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('currentTab');
  const [currentTab, setCurrentTab] = useState(userTabs.find((x) => !x.disabled)?.value || TAB_GENERAL);
  const router = useRouter();

  const handleTabsChange = useCallback((event, value) => {
    setCurrentTab(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab) {
      router.replace(paths.admin.user, undefined, { shallow: true });

      if (userTabs.some((x) => x.value === tab && !x.disabled)) {
        setCurrentTab(tab);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return {
    currentTab,
    handleTabsChange,
  };
};

const Page = () => {
  const { user, setUser, changePassword } = useAuth();
  const settings = useSettings();
  const { t } = useTranslation();
  const userTabs = t(USER_LOCALE.user.tabs, { returnObjects: true }).filter((tab) => {
    const result = hasPermission({ rule: user.rule, routine: 'settings', feature: tab.value, type: RULE_TYPES.TAB });

    if (result.success || result.disabled) {
      tab['disabled'] = result.disabled;
      return tab;
    }
  });
  const userStore = useUsersStore(userTabs);

  usePageView();

  return (
    <>
      <Seo title={t(USER_LOCALE.user.seo)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">{t(USER_LOCALE.user.seo)}</Typography>

            <div>
              <Tabs
                indicatorColor="primary"
                onChange={userStore.handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={userStore.currentTab}
                variant="scrollable"
              >
                {userTabs.map((tab) => {
                  return (
                    <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                      disabled={tab.disabled}
                    />
                  );
                })}
              </Tabs>

              <Divider />
            </div>
          </Stack>

          {userStore.currentTab === TAB_GENERAL && (
            <UserForm
              user={user}
              setUser={setUser}
            />
          )}

          {userStore.currentTab === TAB_ADDRESS && <UserAddressForm userId={user.id} />}

          {userStore.currentTab === TAB_BILLING && (
            <UserBillingForm
              userId={user.id}
              fullName={user?.fullName || ''}
            />
          )}

          {userStore.currentTab === TAB_TEAM && (
            <UserTeamSettings
              userId={user.id}
              email={user.email}
              sysNotification={user.sysNotification}
            />
          )}

          {userStore.currentTab === TAB_SECURITY && (
            <UserSecuritySettings
              userId={user.id}
              password={user.password}
              email={user.email}
              changePassword={changePassword}
            />
          )}
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
