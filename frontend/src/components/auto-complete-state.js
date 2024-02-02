import { TextField, CircularProgress, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Permissions } from 'src/components/permissions';
import { RULE_TYPES } from 'src/settings/constants';

import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';
import { STATE_BR, STATE_US } from 'src/settings/constants';
import { APP } from 'src/settings/config';

const options = APP.COUNTRY === 'br' ? STATE_BR : STATE_US;
const FIELD_ID = 'stateAutoCompleteAsync';
const FIELD_NAME = 'state';

export const AutoCompleteState = (props) => {
  const { formik, ...other } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const loadingAutoComp = open && options.length === 0;

  const handleoptionsOptionSelected = useCallback((option, value) => {
    return value ? option.value === value.value || value.value === '' : true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeAutoComplete = useCallback(
    (option) => {
      formik.setFieldValue('state', option?.label || '');

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
      {option.label} - {option.abbreviation}
    </Box>
  );

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
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={handleoptionsOptionSelected}
          getOptionLabel={(options) => (typeof options === 'string' ? options : options.label)}
          onChange={(event, newValue) => {
            handleChangeAutoComplete(newValue);
          }}
          renderOption={handleRenderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              required
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

AutoCompleteState.propTypes = {
  formik: PropTypes.any.isRequired,
};
