import { TextField, CircularProgress, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Permissions } from 'src/components/permissions';
import { RULE_TYPES } from 'src/settings/constants';

import { FORM_LOCALE } from 'src/locales/form';
import { FIELD_LOCALE } from 'src/locales/field';

export const AutoCompleteCustom = (props) => {
  const { formik, fieldName, fieldId, disabled = false, localeString, ...other } = props;
  const { t } = useTranslation();
  const options = t(localeString, { returnObjects: true });
  const [value, setValue] = useState({ label: '', value: '' });

  const [open, setOpen] = useState(false);
  const loadingAutoComp = open && options.length === 0;

  const handleDataOptionSelected = useCallback(
    (option, value) => {
      return value ? option.value === value.value || value.value === '' : true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChangeAutoComplete = useCallback(
    (option) => {
      formik.setFieldValue([fieldName], option?.value || '');
      setValue(option);

      if (option === null) {
        setOpen(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik]
  );

  const handleRenderOption = (props, option) => (
    <Box
      component="li"
      sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
      {...props}
    >
      {option.label}
    </Box>
  );

  useEffect(() => {
    if (options) {
      const option = options.find((data) => data.value === formik.values[fieldName]);
      if (option) {
        setValue(option);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik]);

  return (
    <>
      <Permissions
        routine={other.routine}
        feature={fieldName}
        type={RULE_TYPES.FIELD}
      >
        <Autocomplete
          {...other}
          id={fieldId}
          fullWidth
          disabled={disabled}
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
          value={value}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={handleDataOptionSelected}
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
              error={!!(formik.touched[fieldName] && formik.errors[fieldName])}
              helperText={formik.touched[fieldName] && formik.errors[fieldName]}
              onBlur={formik.handleBlur}
              label={t(FIELD_LOCALE.field[fieldName])}
              name={fieldName}
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

AutoCompleteCustom.propTypes = {
  formik: PropTypes.any.isRequired,
  fieldName: PropTypes.string.isRequired,
  fieldId: PropTypes.string.isRequired,
  localeString: PropTypes.string.isRequired,
};
