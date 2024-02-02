import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'src/store';
import { Typography, Container, Stack, Box } from '@mui/material';
import { thunks } from 'src/thunks/feed';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { SocialFeedAdd } from 'src/sections/admin/social/social-feed-add';
import { SocialFeedCard } from 'src/sections/admin/social/social-feed-card';
import { useTranslation } from 'react-i18next';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { useAuth } from 'src/hooks/use-auth';
import { Scrollbar } from 'src/components/scrollbar';
import { useNextPage } from 'src/hooks/use-next-page';
import { isNull } from 'lodash';
import { logRegister } from 'src/helpers/log-register';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { useSearchParams } from 'src/hooks/use-search-params';
import { useSettings } from 'src/hooks/use-settings';

import { SOCIAL_LOCALE } from 'src/locales/social';

const useDataFeeds = () => {
  return useSelector((state) => state.feed.feeds);
};

const useFeeds = (setLoading) => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [img, setImg] = useState(null);
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const handleGetFeeds = useCallback(
    async (params = {}) => {
      try {
        const { currentPage } = params;

        if (!isNull(currentPage)) {
          setLoading(true);

          await dispatch(thunks.getFeedsCommentsByConnections({ accountId: user.id, currentPage }));

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

  const handleOpen = (img = null) => {
    setImg(img);
    setOpen(img ? true : false);
  };

  useEffect(() => {
    handleGetFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return {
    user,
    open,
    img,
    handleOpen,
    handleGetFeeds,
  };
};

const Page = () => {
  const settings = useSettings();
  const feeds = useDataFeeds();
  const feedRef = useRef(null);
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);

  usePageView();

  const { user, open, img, handleOpen, handleGetFeeds } = useFeeds(setLoading);

  useNextPage({ handleNextPage: handleGetFeeds, data: feeds.info?.config, ref: feedRef });

  return (
    <LoadingDisabled loading={isLoading}>
      <Seo title={t(SOCIAL_LOCALE.feed.seo)} />

      <Scrollbar
        sx={{
          '& .simplebar-scrollbar:before': {
            background: 'var(--nav-scrollbar-color)',
          },
          maxHeight: 900,
        }}
        ref={feedRef}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth={settings.stretch ? false : 'xl'}>
            <Stack spacing={1}>
              <Typography
                color="text.secondary"
                variant="overline"
              >
                {t(SOCIAL_LOCALE.feed.seo)}
              </Typography>
              <Typography variant="h4">{t(SOCIAL_LOCALE.feed.title)}</Typography>
            </Stack>

            <Stack
              spacing={3}
              sx={{ mt: 3 }}
            >
              <SocialFeedAdd
                user={user}
                feedRef={feedRef}
              />

              {feeds.data.map((feed) => (
                <SocialFeedCard
                  key={feed.id}
                  userId={user.id}
                  feed={feed}
                  onOpen={handleOpen}
                />
              ))}
            </Stack>
            {img && (
              <Lightbox
                open={open}
                close={() => handleOpen()}
                plugins={[Zoom]}
                slides={[{ src: img }]}
                render={{
                  buttonPrev: () => null,
                  buttonNext: () => null,
                }}
              />
            )}
          </Container>
        </Box>
      </Scrollbar>
    </LoadingDisabled>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
