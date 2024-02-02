import { useCallback, useEffect, useState } from 'react';
import { Typography, Button, SvgIcon, Container, Avatar, Stack, Box, Tab, Tabs, Divider } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-hot-toast';
import { getInitials } from 'src/helpers/get-initials';
import { useTranslation } from 'react-i18next';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { useDispatch, useSelector } from 'src/store';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { paths } from 'src/settings/paths';
import { SocialConnections } from 'src/sections/admin/social/social-connections';
import { SocialTimeline } from 'src/sections/admin/social/social-timeline';
import { useAuth } from 'src/hooks/use-auth';
import { setHost } from 'src/helpers/set-host';
import { thunks } from 'src/thunks/feed';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { datetimeZone } from 'src/helpers/datetime-zone';
import { isNull } from 'lodash';
import { useSettings } from 'src/hooks/use-settings';

import { SOCIAL_LOCALE } from 'src/locales/social';
import { FORM_LOCALE } from 'src/locales/form';
import { logRegister } from 'src/helpers/log-register';
import { LINK, LINK_BROKEN, MESSAGE_CHAT } from 'src/settings/icon-constants';

const useDataFeeds = () => {
  return useSelector((state) => state.feed.feeds);
};

const useProfile = (user, updateUser) => {
  const [currentTab, setCurrentTab] = useState('timeline');
  const [status, setStatus] = useState(user?.sysNotification);
  const isMounted = useMounted();
  const { t } = useTranslation();
  const [isLoadingBTN, setLoadingBTN] = useState(false);

  const handleNotificationActive = useCallback(
    async (params) => {
      try {
        setLoadingBTN(true);
        const { sysNotification } = params;

        const values = {
          sysNotification,
          lastConnectedActivity: datetimeZone(),
        };

        await updateUser(values, user.id);

        if (isMounted()) {
          setLoadingBTN(false);
          toast.success(t(FORM_LOCALE.common.success));
          return sysNotification;
        }
      } catch (error) {
        setLoadingBTN(false);
        logRegister(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted]
  );

  const handleNotificationToggle = async () => {
    setStatus(await handleNotificationActive({ sysNotification: !status }));
  };

  const handleTabsChange = useCallback((event, value) => {
    setCurrentTab(value);
  }, []);

  return {
    isLoadingBTN,
    status,
    currentTab,
    handleTabsChange,
    handleNotificationToggle,
  };
};

const useFeeds = (user) => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);

  const handleGetFeeds = useCallback(
    async (params = {}) => {
      try {
        const { currentPage } = params;

        if (!isNull(currentPage)) {
          setLoading(true);

          await dispatch(thunks.getFeedsCommentsByAccount({ accountId: user?.id, currentPage }));

          if (isMounted()) {
            setLoading(false);
          }
        }
      } catch (error) {
        setLoading(false);
        logRegister(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  useEffect(() => {
    handleGetFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    handleGetFeeds,
  };
};

const Page = () => {
  const settings = useSettings();
  const feeds = useDataFeeds();
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const tabs = t(SOCIAL_LOCALE.social.tabs, { returnObjects: true });

  usePageView();

  const { isLoadingBTN, status, currentTab, handleTabsChange, handleNotificationToggle } = useProfile(user, updateUser);
  const { isLoading, handleGetFeeds } = useFeeds(user);

  if (!user) {
    return null;
  }

  return (
    <LoadingDisabled loading={isLoading}>
      <Seo title={t(SOCIAL_LOCALE.social.seo)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <div>
            <Stack
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Typography variant="h4">{t(SOCIAL_LOCALE.social.seo)}</Typography>
            </Stack>

            <Stack
              alignItems="center"
              direction="row"
              spacing={3}
              sx={{ mt: 5 }}
            >
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Avatar
                  src={setHost(user?.avatar)}
                  sx={{
                    height: 64,
                    width: 64,
                  }}
                >
                  {getInitials(user?.fullName)}
                </Avatar>

                <div>
                  <Typography
                    color="text.secondary"
                    variant="overline"
                  >
                    {user.occupation}
                  </Typography>
                  <Typography variant="h6">{user.fullName}</Typography>
                </div>
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{
                  display: {
                    md: 'block',
                    xs: 'none',
                  },
                }}
              >
                {!status && (
                  <LoadingButton
                    onClick={handleNotificationToggle}
                    loadingPosition="start"
                    variant="outlined"
                    startIcon={<SvgIcon>{LINK}</SvgIcon>}
                    size="small"
                    loading={isLoadingBTN}
                  >
                    <span>{t(FORM_LOCALE.button.notificationActive)}</span>
                  </LoadingButton>
                )}

                {status && (
                  <LoadingButton
                    onClick={handleNotificationToggle}
                    loadingPosition="start"
                    variant="outlined"
                    startIcon={<SvgIcon>{LINK_BROKEN}</SvgIcon>}
                    size="small"
                    loading={isLoadingBTN}
                  >
                    <span>{t(FORM_LOCALE.button.notificationDeactive)}</span>
                  </LoadingButton>
                )}

                <Button
                  component={RouterLink}
                  href={paths.admin.chat}
                  size="small"
                  startIcon={<SvgIcon>{MESSAGE_CHAT}</SvgIcon>}
                  variant="contained"
                >
                  {t(FORM_LOCALE.button.sendMessage)}
                </Button>
              </Stack>
            </Stack>
          </div>

          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            sx={{ mt: 5 }}
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
              />
            ))}
          </Tabs>

          <Divider />

          <Box sx={{ mt: 3 }}>
            {currentTab === 'timeline' && (
              <SocialTimeline
                user={user}
                feeds={feeds}
                onNextPage={handleGetFeeds}
              />
            )}
            {currentTab === 'connections' && <SocialConnections />}
          </Box>
        </Container>
      </Box>
    </LoadingDisabled>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
