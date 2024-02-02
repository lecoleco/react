import IconButton from '@mui/material/IconButton';
import { Permissions } from 'src/components/permissions';
import { RULE_TYPES } from 'src/settings/constants';

export const IconButtonRule = (props) => {
  const { ...other } = props;

  return (
    <Permissions
      routine={other.routine}
      feature={other.name}
      type={RULE_TYPES.BUTTON}
    >
      <IconButton {...other} />
    </Permissions>
  );
};
