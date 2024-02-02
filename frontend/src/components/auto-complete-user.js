import { TextField } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMounted } from 'src/hooks/use-mounted';
import GenericService from 'src/services/GenericService';
import formatMask from 'src/helpers/formatMask';
import { useSnackbar } from 'notistack';
import logRegister from 'src/helpers/logRegister';
import { nextPage } from 'src/helpers/next-page';
import IconButtonStl from 'src/components/IconButtonStl';
import Tooltip from '@material-ui/core/Tooltip';

export const AutoCompleteUser = (props) => {
  const { values, setValues, handleLoad, ...other } = props;
  const [open, setOpen] = useState(false);
  const [dataGet, setDataGet] = useState([]);
  const loadingAutoComp = open && dataGet.length === 0;
  const isMounted = useMounted();
  const scrollRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [info, setInfo] = useState({});
  const [textSearch, setTextSearch] = useState(null);

  // TODO do compatibilization like others methods AUTOCOMPLETE

  const handleDataOptionSelected = useCallback(
    (data, value) => {
      if (Object.keys(data).length > 0) {
        if (typeof value === 'string' && value === '') {
          return true;
        }

        return `${data.fullName}` === (typeof value === 'string' ? value : `${value.fullName}`);
      }

      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChangeAutoComplete = useCallback(
    (newValue) => {
      values.id = 0;
      values.name = '';

      if (newValue) {
        values.id = newValue.id;
        values.name = `${newValue.fullName}`;
      }

      setValues(values);

      if (handleLoad) {
        handleLoad(values);
      }

      if (textSearch) {
        setTextSearch(null);
      }

      if (newValue === null) {
        setDataGet([]);
        setOpen(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleRenderOption = (option) => (
    <>
      {' '}
      {option.fullName} - {option.email} {option.telephone !== '' ? '-' : ''} {formatMask(option.telephone, 'telephone')}
    </>
  );

  const getUsers = useCallback(
    async (params = {}) => {
      try {
        const { currentPage = 0, contentSearch = null } = params;

        const requestParam = {
          params: {},
          body: {},
          settings: {
            config: {
              user: {
                currentPage,
                pageSize: 10,
                query: {
                  fields: [{ fullName: contentSearch }],
                },
              },
            },
            order: [{ field: 'fullName', type: 'asc' }],
          },
        };
        const response = await GenericService.requestData('user/find', 'GET', requestParam);

        if (isMounted()) {
          if (response.success) {
            if (contentSearch) {
              setDataGet(response.data);
            } else {
              setDataGet((currentObjects) => currentObjects.concat(response.data));
            }

            setInfo(response.info);
          } else {
            setDataGet([]);
          }
        }
      } catch (error) {
        setOpen(false);
        enqueueSnackbar('Não foi possível carregar os dados!', { variant: 'error' });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted]
  );

  const handleScroll = useCallback(async (currentTarget) => {
    try {
      if (info && info.config) {
        const next = nextPage(info.config, currentTarget);

        if (next) {
          await getUsers({ currentPage: next });
        }
      }
    } catch (error) {
      logRegister(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();

    values.id = 0;
    values.name = '';

    await getUsers({ currentPage: 0, contentSearch: textSearch });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback((e) => {
    e.persist();
    setTextSearch(e.target.value);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataGet.length === 0) {
      getUsers();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataGet]);

  return (
    <>
      <Autocomplete
        {...other}
        id="usersAutoCompleteAsync"
        fullWidth
        handleHomeEndKeys
        selectOnFocus
        options={dataGet}
        loading={loadingAutoComp}
        loadingText="Carregando..."
        openText="Abrir"
        noOptionsText={
          <span>
            <span>Não encontrou dados!</span>
            <Tooltip title="Search Remoto">
              <span>
                <IconButtonStl
                  typeIcon="send"
                  noColor={false}
                  loading={false}
                  disabled={false}
                  onMouseDown={(e) => {
                    handleSearch(e);
                  }}
                />
              </span>
            </Tooltip>
          </span>
        }
        closeText="Fechar"
        clearText="Limpar"
        value={values.name}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={handleDataOptionSelected}
        getOptionLabel={(data) => (typeof data === 'string' ? data : `${data.firstName} ${data.lastName}`)}
        onChange={(event, newValue) => {
          handleChangeAutoComplete(newValue);
        }}
        renderOption={handleRenderOption}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label="Usuário"
            name="name"
            variant="outlined"
            onChange={(e) => handleSearchChange(e)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingAutoComp ? (
                    <CircularProgress
                      color="inherit"
                      size={20}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        ListboxProps={{
          ref: scrollRef,
          onScroll: ({ currentTarget }) => {
            handleScroll(currentTarget);
          },
        }}
      />
    </>
  );
};

AutoCompleteUser.propTypes = {
  values: PropTypes.any,
  setValues: PropTypes.any,
  handleLoad: PropTypes.func.isRequired,
};
