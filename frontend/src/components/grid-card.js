import PropTypes from 'prop-types';
import { Tooltip, Box, IconButton, Unstable_Grid2 as Grid, Card, CardContent, Divider, CardActions, Stack, SvgIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IconButtonRule } from './icon-button-rule';
import { isEmpty } from 'lodash';

import { GRID_LOCALE } from 'src/locales/grid';
import { FIELD_LOCALE } from 'src/locales/field';
import { EDIT, PLUS, TRASH } from 'src/settings/icon-constants';

export const GridCard = (props) => {
  const { routine, items, onInsert, onEdit, onDelete, ...other } = props;
  const { t } = useTranslation();

  if (onInsert && !items.find((e) => e.hasOwnProperty('textAdd'))) {
    items.unshift({ textAdd: t(GRID_LOCALE.button.add) + ' ' + t(FIELD_LOCALE.field.address) });
  }

  return (
    <Grid
      container
      spacing={3}
    >
      {items.map((item) => {
        if (isEmpty(item)) return;

        return (
          <Grid
            key={item?.id || 'insert'}
            md={4}
            xs={12}
          >
            <Card
              sx={{
                height: 310,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
              }}
            >
              {item.hasOwnProperty('default') && (
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: item.default ? 'primary.main' : 'primary.dark',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'space-around',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      variant="subtitle2"
                      color="neutral.50"
                    >
                      {t(FIELD_LOCALE.field.default) + ':'}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="neutral.50"
                    >
                      {item.default ? t(FIELD_LOCALE.field.yes) : t(FIELD_LOCALE.field.no)}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <CardContent
                sx={{
                  pt: 2,
                  height: 210,
                  display: 'flex',
                  justifyContent: item.descriptions ? 'justify-content' : 'center',
                }}
              >
                {item.descriptions && (
                  <div>
                    {item.descriptions.map((description) => {
                      return (
                        <Typography
                          key={description}
                          variant="subtitle2"
                        >
                          {description}
                        </Typography>
                      );
                    })}
                  </div>
                )}
                {!item.descriptions && (
                  <Stack
                    direction="column"
                    spacing={2}
                    alignItems="center"
                  >
                    <div>{''}</div>
                    <IconButtonRule
                      routine={other.routine}
                      name="insert"
                      onClick={onInsert}
                    >
                      <SvgIcon sx={{ color: (theme) => theme.palette.primary.main, opacity: 0.9, width: 120, height: 120 }}>{PLUS}</SvgIcon>
                    </IconButtonRule>
                    {item.textAdd && <Typography variant="subtitle2">{item.textAdd}</Typography>}
                  </Stack>
                )}
              </CardContent>

              {item.descriptions && (
                <>
                  <Divider />

                  <CardActions sx={{ justifyContent: 'center' }}>
                    {item.edit && (
                      <Tooltip title={t(GRID_LOCALE.button.edit)}>
                        <Stack>
                          <IconButtonRule
                            routine={other.routine}
                            name="edit"
                            onClick={() => onEdit({ id: item.id })}
                          >
                            <SvgIcon sx={{ color: (theme) => theme.palette.primary.main, opacity: 0.9, fontSize: 20 }}>{EDIT}</SvgIcon>
                          </IconButtonRule>
                        </Stack>
                      </Tooltip>
                    )}
                    {item.delete && (
                      <Tooltip title={t(GRID_LOCALE.button.delete)}>
                        <Stack>
                          <IconButtonRule
                            routine={other.routine}
                            name="delete"
                            onClick={() => onDelete([{ id: item.id }])}
                          >
                            <SvgIcon sx={{ color: (theme) => theme.palette.primary.main, opacity: 0.9, fontSize: 20 }}>{TRASH}</SvgIcon>
                          </IconButtonRule>
                        </Stack>
                      </Tooltip>
                    )}
                  </CardActions>
                </>
              )}
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

GridCard.propTypes = {
  routine: PropTypes.string,
  items: PropTypes.array.isRequired,
  onInsert: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
