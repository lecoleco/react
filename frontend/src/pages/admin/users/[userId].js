import { useCallback, useState, useEffect } from 'react';
import { Box, Container, Divider, Stack, Tab, Tabs, Typography, Link, SvgIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUrlParam } from 'src/hooks/use-url-param';
import { useAuth } from 'src/hooks/use-auth';
import { thunks } from 'src/thunks/user';
import { useDispatch, useSelector } from 'src/store';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { logRegister } from 'src/helpers/log-register';
import { useMounted } from 'src/hooks/use-mounted';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { UserForm } from 'src/sections/admin/user/user-form';
import { UserAddressForm } from 'src/sections/admin/user/user-address-form';
import { isEmpty } from 'lodash';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/settings/paths';
import { useSettings } from 'src/hooks/use-settings';

import { USER_LOCALE } from 'src/locales/user';
import { ARROW_LEFT } from 'src/settings/icon-constants';

const useDataUsers = () => {
  return useSelector((state) => state.user.user);
};

const useUsersStore = () => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const [isLoading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  const userId = useUrlParam('userId');

  const getUser = useCallback(
    async () => {
      try {
        setLoading(true);

        await dispatch(thunks.getUser(userId));

        if (isMounted()) {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        logRegister(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const handleTabsChange = useCallback((event, value) => {
    setCurrentTab(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      getUser();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId]
  );

  return {
    isLoading,
    currentTab,
    handleTabsChange,
  };
};

const Page = () => {
  const { setUser } = useAuth();
  const settings = useSettings();
  const { t } = useTranslation();
  const userTabs = t(USER_LOCALE.user.tabs, { returnObjects: true }).filter((x) => x.value === 'general' || x.value === 'address');
  const userState = useDataUsers();
  const userStore = useUsersStore();

  usePageView();

  if (isEmpty(userState)) {
    return null;
  }

  return (
    <LoadingDisabled loading={userStore.isLoading}>
      <Seo title={t(USER_LOCALE.user.seoList)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <div>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.admin.users.index}
              sx={{
                alignItems: 'center',
                display: 'inline-flex',
                mb: 4,
              }}
              underline="hover"
            >
              <SvgIcon sx={{ mr: 1 }}>{ARROW_LEFT}</SvgIcon>
              <Typography variant="subtitle2">{t(USER_LOCALE.user.seoList)}</Typography>
            </Link>
          </div>

          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">{t(USER_LOCALE.user.edit)}</Typography>

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

          {userStore.currentTab === 'general' && (
            <UserForm
              user={userState}
              setUser={setUser}
              isUserList={true}
            />
          )}
          {userStore.currentTab === 'address' && <UserAddressForm userId={userState.id} />}
        </Container>
      </Box>
    </LoadingDisabled>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
