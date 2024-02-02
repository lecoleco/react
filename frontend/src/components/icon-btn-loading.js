import { SvgIcon, IconButton, CircularProgress, Box, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

export const IconBtnLoading = (props) => {
  const { loading = false, onClick, btnOn, btnOff, isDefault = true, onOff = true, title = '', isButton = true, ...other } = props;

  return (
    <Box
      sx={{ display: 'inline-block', m: 0, position: 'relative' }}
      {...other}
    >
      {isButton && (
        <Tooltip title={title}>
          <IconButton
            {...other}
            disabled={loading}
            onClick={onClick}
            color={isDefault ? 'none' : 'primary'}
          >
            <SvgIcon
              fontSize="medium"
              sx={{ opacity: loading ? 0.3 : null }}
            >
              {' '}
              {onOff ? btnOn : btnOff}{' '}
            </SvgIcon>
          </IconButton>
        </Tooltip>
      )}

      {!isButton && (
        <Tooltip
          title={title}
          {...other}
        >
          <div>
            <SvgIcon
              fontSize="medium"
              color="action"
              sx={{ mt: 1, opacity: loading ? 0.3 : null }}
            >
              {' '}
              {onOff ? btnOn : btnOff}{' '}
            </SvgIcon>
          </div>
        </Tooltip>
      )}

      {loading && (
        <CircularProgress
          {...other}
          size={24}
          sx={{
            color: (theme) => theme.palette.primary.main,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
    </Box>
  );
};

IconBtnLoading.propTypes = {
  btnOn: PropTypes.any.isRequired,
  btnOff: PropTypes.any,
  onOff: PropTypes.bool,
  onClick: PropTypes.func,
};
