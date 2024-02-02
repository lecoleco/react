import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { LogisticsDeviatedVehicles } from 'src/sections/admin/panel/logistics-deviated-vehicles';
import { LogisticsErrorVehicles } from 'src/sections/admin/panel/logistics-error-vehicles';
import { LogisticsLateVehicles } from 'src/sections/admin/panel/logistics-late-vehicles';
import { LogisticsRouteVehicles } from 'src/sections/admin/panel/logistics-route-vehicles';
import { LogisticsVehiclesCondition } from 'src/sections/admin/panel/logistics-vehicles-condition';
import { LogisticsVehiclesList } from 'src/sections/admin/panel/logistics-vehicles-list';
import { LogisticsVehiclesOverview } from 'src/sections/admin/panel/logistics-vehicles-overview';
import { PLUS } from 'src/settings/icon-constants';

const Page = () => {
  const settings = useSettings();

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Panel" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Grid
            container
            spacing={{
              xs: 3,
              lg: 4,
            }}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">Panel</Typography>
                </div>
                <div>
                  <Stack
                    direction="row"
                    spacing={4}
                  >
                    <Button
                      startIcon={<SvgIcon>{PLUS}</SvgIcon>}
                      variant="contained"
                    >
                      Add Vehicle
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={3}
            >
              <LogisticsRouteVehicles amount={38} />
            </Grid>
            <Grid
              xs={12}
              md={3}
            >
              <LogisticsErrorVehicles amount={2} />
            </Grid>
            <Grid
              xs={12}
              md={3}
            >
              <LogisticsDeviatedVehicles amount={1} />
            </Grid>
            <Grid
              xs={12}
              md={3}
            >
              <LogisticsLateVehicles amount={2} />
            </Grid>
            <Grid
              xs={12}
              lg={6}
            >
              <LogisticsVehiclesOverview
                chartSeries={[38, 50, 12]}
                labels={['Available', 'Out of service', 'On route']}
              />
            </Grid>
            <Grid
              xs={12}
              lg={6}
            >
              <LogisticsVehiclesCondition
                bad={12}
                excellent={181}
                good={24}
              />
            </Grid>
            <Grid xs={12}>
              <LogisticsVehiclesList
                vehicles={[
                  {
                    id: 'VOL-653CD1',
                    endingRoute: 'Cleveland, Ohio, USA',
                    startingRoute: 'Cleveland, Ohio, USA',
                    status: 'success',
                    temperature: 8,
                    temperatureLabel: 'Very Good',
                  },
                  {
                    id: 'VOL-653CD2',
                    endingRoute: 'Cleveland, Ohio, USA',
                    startingRoute: 'Cleveland, Ohio, USA',
                    status: 'warning',
                    temperature: 8,
                    temperatureLabel: 'Very Good',
                    warning: 'Temperature not optimal',
                  },
                  {
                    id: 'VOL-653CD3',
                    endingRoute: 'Cleveland, Ohio, USA',
                    startingRoute: 'Cleveland, Ohio, USA',
                    status: 'error',
                    temperature: 8,
                    temperatureLabel: 'Very Good',
                    warning: 'ECU not responding',
                  },
                  {
                    id: 'VOL-653CD4',
                    endingRoute: 'Cleveland, Ohio, USA',
                    startingRoute: 'Cleveland, Ohio, USA',
                    status: 'success',
                    temperature: 8,
                    temperatureLabel: 'Very Good',
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
