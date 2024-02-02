import { TextField, CircularProgress, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMounted } from 'src/hooks/use-mounted';
import { serviceApi } from 'src/services/service-api';
import { Permissions } from 'src/components/permissions';
import { RULE_TYPES } from 'src/settings/constants';

import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';

const FIELD_ID = 'ruleAutoCompleteAsync';
const FIELD_NAME = 'rule';

export const AutoCompleteRule = (props) => {
  const { formik, ...other } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loadingAutoComp = open && options.length === 0;
  const isMounted = useMounted();

  const handleoptionsOptionSelected = useCallback((option, value) => {
    return value ? option.value === value.value || value.value === '' : true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeAutoComplete = useCallback(
    (option) => {
      formik.setFieldValue('rule', option ? { id: option.id, name: option.name } : null);

      if (option === null) {
        setOpen(false);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [formik]
  );

  const handleRenderOption = (props, option) => (
    <Box
      component="li"
      sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
      {...props}
    >
      {option.name}
    </Box>
  );

  const getRules = useCallback(
    async (params = {}) => {
      try {
        const { currentPage = 0 } = params;

        const requestParam = {
          settings: {
            config: { rule: { currentPage, pageSize: 20 } },
            order: [{ field: 'name', type: 'asc' }],
          },
        };
        const response = await serviceApi.requestData('rule/find', 'POST', requestParam);

        if (isMounted()) {
          if (response.success) {
            setOptions(response.data);
          }
        }
      } catch (error) {
        setOpen(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMounted, setOptions]
  );

  useEffect(() => {
    getRules();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Permissions
        routine={other.routine}
        feature={FIELD_NAME}
        type={RULE_TYPES.FIELD}
      >
        <Autocomplete
          {...other}
          id={FIELD_ID}
          fullWidth
          handleHomeEndKeys
          selectOnFocus
          options={options}
          autoHighlight
          loading={loadingAutoComp}
          loadingText={t(FORM_LOCALE.common.load)}
          openText={t(FORM_LOCALE.common.open)}
          noOptionsText={t(FORM_LOCALE.common.notFound)}
          closeText={t(FORM_LOCALE.common.close)}
          clearText={t(FORM_LOCALE.common.clean)}
          value={formik.values[FIELD_NAME]}
          open={open}
          onOpen={() => {
            options.length > 0 ? setOpen(true) : false;
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={handleoptionsOptionSelected}
          getOptionLabel={(options) => (typeof options === 'string' ? options : options?.name || '')}
          onChange={(event, newValue) => {
            handleChangeAutoComplete(newValue);
          }}
          renderOption={handleRenderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!(formik.touched[FIELD_NAME] && formik.errors[FIELD_NAME])}
              helperText={formik.touched[FIELD_NAME] && formik.errors[FIELD_NAME]}
              onBlur={formik.handleBlur}
              label={t(FIELD_LOCALE.field[FIELD_NAME])}
              name={FIELD_NAME}
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
        />
      </Permissions>
    </>
  );
};

AutoCompleteRule.propTypes = {
  formik: PropTypes.any.isRequired,
};
