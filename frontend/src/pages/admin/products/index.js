import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { useSettings } from 'src/hooks/use-settings';

import { productsApi } from 'src/api/products';
import { BreadcrumbsSeparator } from 'src/components/breadcrumbs-separator';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { paths } from 'src/settings/paths';
import { ProductListSearch } from 'src/sections/admin/product/product-list-search';
import { ProductListTable } from 'src/sections/admin/product/product-list-table';
import { PLUS } from 'src/settings/icon-constants';

const useProductsSearch = () => {
  const [state, setState] = useState({
    filters: {
      name: undefined,
      category: [],
      status: [],
      inStock: undefined,
    },
    page: 0,
    rowsPerPage: 10,
  });

  const handleFiltersChange = useCallback((filters) => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const useProductsStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    products: [],
    productsCount: 0,
  });

  const handleProductsGet = useCallback(async () => {
    try {
      const response = await productsApi.getProducts(searchState);

      if (isMounted()) {
        setState({
          products: response.data,
          productsCount: response.count,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleProductsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
  };
};

const Page = () => {
  const productsSearch = useProductsSearch();
  const productsStore = useProductsStore(productsSearch.state);
  const settings = useSettings();

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Product List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack spacing={4}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Products</Typography>
                <Breadcrumbs separator={<BreadcrumbsSeparator />}>
                  <Link
                    color="text.primary"
                    component={RouterLink}
                    href={paths.admin.index}
                    variant="subtitle2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    color="text.primary"
                    component={RouterLink}
                    href={paths.admin.products.index}
                    variant="subtitle2"
                  >
                    Products
                  </Link>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                  >
                    List
                  </Typography>
                </Breadcrumbs>
              </Stack>

              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                <Button
                  component={RouterLink}
                  href={paths.admin.products.create}
                  startIcon={<SvgIcon>{PLUS}</SvgIcon>}
                  variant="contained"
                >
                  Add
                </Button>
              </Stack>
            </Stack>
            <Card>
              <ProductListSearch onFiltersChange={productsSearch.handleFiltersChange} />
              <ProductListTable
                onPageChange={productsSearch.handlePageChange}
                onRowsPerPageChange={productsSearch.handleRowsPerPageChange}
                page={productsSearch.state.page}
                items={productsStore.products}
                count={productsStore.productsCount}
                rowsPerPage={productsSearch.state.rowsPerPage}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
