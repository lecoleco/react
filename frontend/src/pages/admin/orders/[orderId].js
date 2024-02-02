import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { ordersApi } from 'src/api/orders';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { paths } from 'src/settings/paths';
import { OrderItems } from 'src/sections/admin/order/order-items';
import { OrderLogs } from 'src/sections/admin/order/order-logs';
import { OrderSummary } from 'src/sections/admin/order/order-summary';
import { ARROW_LEFT, CALENDAR, CHEVRON_DOWN, EDIT } from 'src/settings/icon-constants';

const useOrder = () => {
  const isMounted = useMounted();
  const [order, setOrder] = useState(null);

  const handleOrderGet = useCallback(async () => {
    try {
      const response = await ordersApi.getOrder();

      if (isMounted()) {
        setOrder(response);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleOrderGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return order;
};

const Page = () => {
  const order = useOrder();

  usePageView();

  if (!order) {
    return null;
  }

  const createdAt = format(order.createdAt, 'dd/MM/yyyy HH:mm');

  return (
    <>
      <Seo title="Dashboard: Order Details" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <div>
              <Link
                color="text.primary"
                component={RouterLink}
                href={paths.admin.orders.index}
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex',
                }}
                underline="hover"
              >
                <SvgIcon sx={{ mr: 1 }}>{ARROW_LEFT}</SvgIcon>
                <Typography variant="subtitle2">Orders</Typography>
              </Link>
            </div>
            <div>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={3}
              >
                <Stack spacing={1}>
                  <Typography variant="h4">{order.number}</Typography>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Placed on
                    </Typography>
                    <SvgIcon color="action">{CALENDAR}</SvgIcon>
                    <Typography variant="body2">{createdAt}</Typography>
                  </Stack>
                </Stack>
                <div>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <Button
                      color="inherit"
                      endIcon={<SvgIcon>{EDIT}</SvgIcon>}
                    >
                      Edit
                    </Button>
                    <Button
                      endIcon={<SvgIcon>{CHEVRON_DOWN}</SvgIcon>}
                      variant="contained"
                    >
                      Action
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </div>
            <OrderSummary order={order} />
            <OrderItems items={order.items || []} />
            <OrderLogs logs={order.logs || []} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
