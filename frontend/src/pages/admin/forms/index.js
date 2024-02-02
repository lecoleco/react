import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { jobsApi } from 'src/api/jobs';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { paths } from 'src/settings/paths';
import { CompanyCard } from 'src/sections/admin/forms/company-card';
import { JobListSearch } from 'src/sections/admin/forms/job-list-search';
import { CHEVRON_LEFT, CHEVRON_RIGHT } from 'src/settings/icon-constants';

const useCompanies = () => {
  const isMounted = useMounted();
  const [companies, setCompanies] = useState([]);

  const handleCompaniesGet = useCallback(async () => {
    try {
      const response = await jobsApi.getCompanies();

      if (isMounted()) {
        setCompanies(response);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleCompaniesGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return companies;
};

const Page = () => {
  const companies = useCompanies();

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Job Browse" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid
            alignItems="center"
            container
            sx={{
              backgroundColor: 'neutral.900',
              borderRadius: 1,
              color: 'common.white',
              px: 4,
              py: 8,
            }}
          >
            <Grid
              xs={12}
              sm={7}
            >
              <Typography
                color="inherit"
                variant="h3"
              >
                Reach 50k+ potential candidates.
              </Typography>
              <Typography
                color="neutral.500"
                sx={{ mt: 2 }}
                variant="body1"
              >
                Post your job today for free. Promotions start at $99.
              </Typography>
              <Button
                color="primary"
                component={RouterLink}
                href={paths.admin.forms.create}
                size="large"
                sx={{ mt: 3 }}
                variant="contained"
              >
                Post a job
              </Button>
            </Grid>
            <Grid
              sm={5}
              sx={{
                display: {
                  xs: 'none',
                  sm: 'flex',
                },
                justifyContent: 'center',
              }}
            >
              <img src="/assets/iconly/iconly-glass-shield.svg" />
            </Grid>
          </Grid>
          <Stack
            spacing={4}
            sx={{ mt: 4 }}
          >
            <JobListSearch />
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
              />
            ))}
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
              spacing={2}
              sx={{
                px: 3,
                py: 2,
              }}
            >
              <IconButton disabled>
                <SvgIcon fontSize="small">{CHEVRON_LEFT}</SvgIcon>
              </IconButton>
              <IconButton>
                <SvgIcon fontSize="small">{CHEVRON_RIGHT}</SvgIcon>
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
