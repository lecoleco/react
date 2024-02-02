import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as MainLayout } from 'src/layouts/home';
import { HomeFaqs } from 'src/sections/home/home-faqs';
import { HomeFeatures } from 'src/sections/home/home-features';
import { Home } from 'src/sections/home';
import { useTranslation } from 'react-i18next';

import { HOME_LOCALE } from 'src/locales/home';

const Page = () => {
  const { t } = useTranslation();

  usePageView();

  return (
    <>
      <Seo title={t(HOME_LOCALE.index.seo)} />

      <main>
        <Home />
        <HomeFeatures />
        <HomeFaqs />
      </main>
    </>
  );
};

Page.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Page;
