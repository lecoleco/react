import { Box, Container, Divider, Stack, Tabs, Tab, Typography, Link, SvgIcon } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { useTranslation } from 'react-i18next';
import { logRegister } from 'src/helpers/log-register';
import { thunks } from 'src/thunks/customer';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { useUrlParam } from 'src/hooks/use-url-param';
import { useDispatch, useSelector } from 'src/store';
import { useMounted } from 'src/hooks/use-mounted';
import { useCallback, useEffect, useState } from 'react';
import { CustomerForm } from 'src/sections/admin/customer/customer-form';
import { CustomerAddressForm } from 'src/sections/admin/customer/customer-address-form';
import { CustomerBillingForm } from 'src/sections/admin/customer/customer-billing-form';
import { CustomerSecuritySettings } from 'src/sections/admin/customer/customer-security-settings';
import { hasPermission } from 'src/helpers/has-permission';
import { useAuth } from 'src/hooks/use-auth';
import { isEmpty } from 'lodash';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/settings/paths';
import { useSettings } from 'src/hooks/use-settings';

import { CUSTOMER_LOCALE } from 'src/locales/customer';
import { RULE_TYPES } from 'src/settings/constants';
import { ARROW_LEFT } from 'src/settings/icon-constants';

const TAB_GENERAL = 'general';
const TAB_ADDRESS = 'address';
const TAB_BILLING = 'billing';
const TAB_SECURITY = 'security';

const useDataCustomers = () => {
  return useSelector((state) => state.customer.customer);
};

const useCustomerStore = () => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(TAB_GENERAL);
  const customerId = useUrlParam('customerId');

  const getCustomer = useCallback(
    async (customerId) => {
      try {
        setLoading(true);

        await dispatch(thunks.getCustomer(customerId));

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

  useEffect(() => {
    if (customerId !== 'new') {
      getCustomer(customerId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return {
    isLoading,
    currentTab,
    customerId,
    handleTabsChange,
  };
};

const Page = () => {
  const settings = useSettings();
  const { user } = useAuth();
  const { t } = useTranslation();
  const customerTabs = t(CUSTOMER_LOCALE.customer.tabs, { returnObjects: true }).filter((tab) => {
    const result = hasPermission({ rule: user.rule, routine: 'customers', feature: tab.value, type: RULE_TYPES.TAB });

    if (result.success || result.disabled) {
      tab['disabled'] = result.disabled;
      return tab;
    }
  });
  const customersState = useDataCustomers();
  const customerStore = useCustomerStore();

  usePageView();

  if (isEmpty(customersState) && customerStore.customerId !== 'new') {
    return null;
  }

  return (
    <LoadingDisabled loading={customerStore.isLoading}>
      <Seo title={t(CUSTOMER_LOCALE.customer.seo)} />

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
              href={paths.admin.customers.index}
              sx={{
                alignItems: 'center',
                display: 'inline-flex',
                mb: 4,
              }}
              underline="hover"
            >
              <SvgIcon sx={{ mr: 1 }}>{ARROW_LEFT}</SvgIcon>
              <Typography variant="subtitle2">{t(CUSTOMER_LOCALE.customer.seo)}</Typography>
            </Link>
          </div>
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">{customerStore.customerId === 'new' ? t(CUSTOMER_LOCALE.customer.insert) : t(CUSTOMER_LOCALE.customer.edit)}</Typography>

            <div>
              <Tabs
                indicatorColor="primary"
                onChange={customerStore.handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={customerStore.currentTab}
                variant="scrollable"
              >
                {customerTabs.map((tab) => {
                  if (customerStore.customerId !== 'new' || tab.value === TAB_GENERAL) {
                    return (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                        disabled={tab.disabled}
                      />
                    );
                  }
                })}
              </Tabs>

              <Divider />
            </div>
          </Stack>

          {customerStore.currentTab === TAB_GENERAL && (
            <CustomerForm
              customer={customersState}
              userId={user.id}
              userRole={user.role}
            />
          )}
          {customerStore.currentTab === TAB_ADDRESS && <CustomerAddressForm customerId={customersState.id} />}
          {customerStore.currentTab === TAB_BILLING && (
            <CustomerBillingForm
              customerId={customersState.id}
              fullName={customersState?.fullName || ''}
            />
          )}
          {customerStore.currentTab === TAB_SECURITY && (
            <CustomerSecuritySettings
              customerId={customersState.id}
              password={customersState.password}
              email={customersState.email}
              fullName={customersState.fullName}
            />
          )}
        </Container>
      </Box>
    </LoadingDisabled>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
