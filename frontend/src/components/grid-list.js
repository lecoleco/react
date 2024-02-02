import PropTypes from 'prop-types';
import { Box, Checkbox, Avatar, Stack, SvgIcon, Typography, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RouterLink } from 'src/components/router-link';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { SeverityPill } from 'src/components/severity-pill';
import { setHost } from 'src/helpers/set-host';
import { Scrollbar } from './scrollbar';
import { ButtonRule } from './button-rule';
import { IconButtonRule } from './icon-button-rule';
import { isEmpty, isArray } from 'lodash';
import { logRegister } from 'src/helpers/log-register';
import { GRID_LOCALE } from 'src/locales/grid';
import { LIST, ARROW_RIGHT, EDIT, TRASH, THUMBS_UP, THUMBS_DOWN, USER } from 'src/settings/icon-constants';

const GridBlank = () => {
  const { t } = useTranslation();

  return (
    <Stack
      spacing={1}
      sx={{
        p: 4,
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <SvgIcon
        sx={{
          fontSize: 130,
          opacity: 0.7,
        }}
      >
        {LIST}
      </SvgIcon>
      <Typography
        color="text.secondary"
        variant="subtitle1"
      >
        {t(GRID_LOCALE.grid.blank)}
      </Typography>
    </Stack>
  );
};

export const GridList = (props) => {
  const {
    count = 0,
    columns,
    height = 400,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    onDelete,
    onAccept,
    onReject,
    onEdit,
    pagination,
    onSortChange,
    sort,
    selected = null,
    ...other
  } = props;

  const { t } = useTranslation();
  const ACTION = 'action';

  const statusMap = {
    accepted: 'success',
    owner: 'success',
    pending: 'info',
    canceled: 'warning',
    rejected: 'error',
  };

  const selectedSome = selected ? selected.length > 0 && selected.length < items.length : null;
  const selectedAll = selected ? items.length > 0 && selected.length === items.length : null;
  const enableBulkActions = selected && selected.length > 0;

  const createSortHandler = (property) => (event) => {
    const isAsc = sort?.sortBy === property && sort?.sortDir === 'asc';
    onSortChange?.(event, property, isAsc);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        border: 0,
        borderColor: (theme) => theme.palette.divider,
        boxShadow: (theme) => theme.shadows[6],
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
      }}
    >
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.200'),
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 0.5,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            id="grid-checkbox-all"
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectAll?.();
              } else {
                onDeselectAll?.();
              }
            }}
          />

          {onDelete && (
            <ButtonRule
              routine={other.routine}
              name="delete"
              color="inherit"
              size="small"
              onClick={() => onDelete(selected)}
            >
              {t(GRID_LOCALE.button.delete)}
            </ButtonRule>
          )}

          {selected.length === 1 && onEdit && (
            <ButtonRule
              routine={other.routine}
              name="edit"
              color="inherit"
              size="small"
              onClick={() => onEdit(selected[0])}
            >
              {t(GRID_LOCALE.button.edit)}
            </ButtonRule>
          )}
        </Stack>
      )}

      {items.length === 0 || isEmpty(items[0]?.id) ? (
        <GridBlank />
      ) : (
        <div>
          <Box sx={{ height: height }}>
            <Scrollbar
              sx={{
                '& .simplebar-scrollbar:before': {
                  background: 'var(--nav-scrollbar-color)',
                },
                maxHeight: height + 10,
              }}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                sx={{ minWidth: 700 }}
              >
                <TableHead>
                  <TableRow>
                    {selected && (
                      <TableCell
                        padding="checkbox"
                        sx={{ p: 0.5 }}
                      >
                        <Checkbox
                          id="grid-checkbox-all-table"
                          checked={selectedAll}
                          indeterminate={selectedSome}
                          onChange={(event) => {
                            if (event.target.checked) {
                              onSelectAll?.();
                            } else {
                              onDeselectAll?.();
                            }
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={sort?.sortBy === columns.id ? sort?.sortDir : false}
                        style={{ whiteSpace: column.nowrap }}
                        sx={{ p: 1 }}
                      >
                        {!column?.nosort && ACTION !== column.id ? (
                          <TableSortLabel
                            key={column.id}
                            active={sort?.sortBy === column.id}
                            direction={sort?.sortBy === column.id ? sort?.sortDir : 'asc'}
                            onClick={createSortHandler(column.sortKey ? column.sortKey : column.id)}
                          >
                            {column.label}{' '}
                            {sort?.sortBy === column.id ? (
                              <Box
                                component="span"
                                sx={visuallyHidden}
                              >
                                {sort?.sortDir === 'desc' ? t(GRID_LOCALE.sort.desc) : t(GRID_LOCALE.sort.asc)}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          <> {column.label} </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.map((item) => {
                    const isSelected = selected && selected.some((select) => select.id === item.id);

                    return (
                      <TableRow
                        hover
                        key={item.id}
                        selected={isSelected}
                      >
                        {selected && (
                          <TableCell
                            padding="checkbox"
                            sx={{ p: 0.5 }}
                          >
                            <Checkbox
                              id={item.id}
                              checked={isSelected}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  onSelectOne?.({ id: item.id });
                                } else {
                                  onDeselectOne?.({ id: item.id });
                                }
                              }}
                              value={isSelected}
                            />
                          </TableCell>
                        )}

                        {columns.map((column) => {
                          let value = '';

                          if (column.subId && item[column.subId]) {
                            if (isArray(item[column.subId])) {
                              const tam = item[column.subId].length;

                              if (tam !== 0) {
                                value = item[column.subId][0][column.id];
                              }

                              if (tam > 1) {
                                logRegister('Veriry inner_hits search, return more than one register');
                              }
                            } else {
                              value = item[column.subId][column.id];
                            }
                          } else {
                            value = item[column.id];
                          }

                          if (column.localeString && !isEmpty(value)) {
                            value = column.localeString.find((data) => data.value === value).label;
                          }

                          let severityColor = null;

                          if (column.type === 'severity' && value) {
                            const statusColor = statusMap[value.toLowerCase()];
                            severityColor = statusColor ? statusColor : null;
                          }
                          return (
                            <TableCell
                              sx={{ p: 0.5 }}
                              key={column.id}
                              align={column.align}
                              style={{ whiteSpace: column.nowrap }}
                            >
                              {column.type === 'avatar' ? (
                                <Stack
                                  alignItems="center"
                                  direction="row"
                                  spacing={1}
                                >
                                  <Avatar
                                    src={setHost(column.subId ? item[column.subId]['avatar'] : item['avatar'])}
                                    sx={{ height: 40, width: 40 }}
                                  >
                                    <SvgIcon>{USER}</SvgIcon>
                                  </Avatar>
                                  <div>
                                    <Typography variant="subtitle2">{column.subId ? item[column.subId]['fullName'] : item['fullName']}</Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                    >
                                      {column.subId ? item[column.subId]['email'] : item['email']}
                                    </Typography>
                                  </div>
                                </Stack>
                              ) : (
                                <>
                                  {ACTION !== column.id ? (
                                    <>
                                      {severityColor ? (
                                        <SeverityPill color={severityColor}>{column.format ? column.format(value) : value}</SeverityPill>
                                      ) : column.format ? (
                                        column.format(value)
                                      ) : (
                                        value
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {column.edit && (
                                        <IconButtonRule
                                          routine={other.routine}
                                          name="edit"
                                          onClick={() => onEdit({ id: item.id })}
                                        >
                                          <SvgIcon>{EDIT}</SvgIcon>
                                        </IconButtonRule>
                                      )}
                                      {column.delete && (
                                        <IconButtonRule
                                          routine={other.routine}
                                          name="delete"
                                          onClick={() => onDelete([{ id: item.id }])}
                                        >
                                          <SvgIcon>{TRASH}</SvgIcon>
                                        </IconButtonRule>
                                      )}
                                      {column.accept && (
                                        <IconButtonRule
                                          routine={other.routine}
                                          name="accept"
                                          onClick={() => onAccept(item, 'accept')}
                                        >
                                          <SvgIcon sx={{ color: (theme) => theme.palette.primary.main, opacity: 0.7 }}>{THUMBS_UP}</SvgIcon>
                                        </IconButtonRule>
                                      )}
                                      {column.reject && (
                                        <IconButtonRule
                                          routine={other.routine}
                                          name="reject"
                                          onClick={() => onReject(item, 'reject')}
                                        >
                                          <SvgIcon sx={{ color: (theme) => theme.palette.error.main, opacity: 0.7 }}>{THUMBS_DOWN}</SvgIcon>
                                        </IconButtonRule>
                                      )}
                                      {column.href && column.hRefUrlParam && (
                                        <IconButtonRule
                                          routine={other.routine}
                                          name="view"
                                          component={RouterLink}
                                          href={column.href.replace(`${column.hRefUrlParam}`, item.id)}
                                        >
                                          <SvgIcon>{ARROW_RIGHT}</SvgIcon>
                                        </IconButtonRule>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <Box sx={{ height: 70 }}>
            <TablePagination
              component="div"
              count={count}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              page={pagination?.page || 0}
              rowsPerPage={pagination?.rowsPerPage || 10}
              rowsPerPageOptions={[10, 20, 30]}
              sx={{
                '.MuiTablePagination-toolbar': {
                  overflow: 'hidden',
                  m: 0,
                  p: 0,
                  px: 1,
                  mt: 2,
                },
                '.MuiToolbar-root': {
                  justifyContent: 'left',
                  ml: 1,
                },
                '.MuiTablePagination-selectLabel': {
                  fontSize: 12,
                },
                '.MuiTablePagination-select': {
                  fontSize: 12,
                },
                '.MuiTablePagination-displayedRows': {
                  fontSize: 12,
                },
              }}
              slotProps={{
                select: {
                  MenuProps: {
                    sx: {
                      '.MuiTablePagination-menuItem': {
                        fontSize: 12,
                        minHeight: 30,
                      },
                      '.MuiTablePagination-menuItem.Mui-selected': {
                        fontSize: 12,
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </div>
      )}
    </Box>
  );
};

GridList.propTypes = {
  count: PropTypes.number,
  columns: PropTypes.array.isRequired,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onSortChange: PropTypes.func,
  pagination: PropTypes.object,
  sort: PropTypes.object,
  selected: PropTypes.array,
};
