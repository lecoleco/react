import { serviceApi } from 'src/services/service-api';
import { slice } from 'src/slices/user';
import { applySettingsRemote } from 'src/helpers/apply-settings-remote';

const getUsers = (params) => async (dispatch) => {
  const { searchState, userId } = params;
  const { searchFields, filterFields } = applySettingsRemote({ searchState });

  const requestParam = {
    params: { removeTargets: ['*.plans', '*.addresses', '*.billing', '*.teams'] },
    settings: {
      sources: [
        { source: 'bool|must_not', filter: { type: 'term', fields: [{ _id: userId }] } },
        { source: 'bool|must', filter: { type: 'term', fields: filterFields }, search: { fields: searchFields } },
      ],
      config: {
        user: {
          currentPage: searchState.pagination.page,
          pageSize: searchState.pagination.rowsPerPage,
        },
      },
      orders: [{ field: searchState.sort.sortBy, type: searchState.sort.sortDir }],
    },
  };

  const response = await serviceApi.requestData('user/find', 'POST', requestParam);

  dispatch(slice.actions.setUsers(response));
};

const getUser = (params) => async (dispatch) => {
  const userId = params;

  const requestParam = {
    params: { accountId: userId, removeTargets: ['*.plans', '*.addresses', '*.billing', '*.teams'] },
    body: {},
    settings: {},
  };

  const response = await serviceApi.requestData('user/findById', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setUser(response.data));
  }
};

const updateUser = (params) => async (dispatch) => {
  const user = params;

  dispatch(slice.actions.setUser(user));
};

const saveUser = (params) => async (dispatch) => {
  const { email = null, values, userId, update = false } = params;

  if (values?.rule) {
    values.rule = { id: values.rule.id, name: values.rule.name };
  }

  const requestParam = {
    params: { accountId: userId, email, update },
    body: values,
    settings: {},
  };

  const response = await serviceApi.requestData('user/store', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setUser(response.data));
  }
};

const getMembersTeam = (params) => async (dispatch) => {
  const { userId } = params;

  const requestParam = {
    settings: {
      sources: [{ source: 'bool|must', nested: true, filter: { type: 'term', fields: [{ accountId: userId }] } }],
    },
  };

  const response = await serviceApi.requestData('userTeam/findMember', 'POST', requestParam);

  dispatch(slice.actions.setMembersTeam({ members: response.data }));
};

const getAddresses = (params) => async (dispatch) => {
  const { userId } = params;

  const requestParam = {
    settings: {
      sources: [{ source: 'bool|must', nested: true, filter: { type: 'term', fields: [{ _id: userId }] }, orders: [{ field: 'main', type: 'desc' }] }],
      config: {
        addresses: {
          currentPage: 0,
          pageSize: 10,
        },
      },
    },
  };

  const response = await serviceApi.requestData('userAddress/find', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setAddresses(response));
  }
};

const saveAddress = (params) => async (dispatch) => {
  const { values, userId } = params;

  const requestParam = {
    params: { accountId: userId },
    body: [values],
    settings: {},
  };

  const response = await serviceApi.requestData('userAddress/store', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.saveAddress(response.data[0]));
  }
};

const delAddress = (params) => async (dispatch) => {
  const { userId, items } = params;

  const requestParam = {
    params: { accountId: userId, deleteIds: items },
    body: {},
    settings: {},
  };
  const response = await serviceApi.requestData('userAddress/delete', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.delAddress(items.map((item) => item.id)));
  }
};

const getBilling = (params) => async (dispatch) => {
  const { userId } = params;

  const requestParam = {
    params: { accountId: userId },
    body: {},
    settings: {},
  };
  const response = await serviceApi.requestData('userBilling/findById', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setBilling(response.data));
  }
};

const saveBilling = (params) => async (dispatch) => {
  const { values, userId } = params;

  const requestParam = {
    params: { accountId: userId },
    body: values,
    settings: {},
  };

  const response = await serviceApi.requestData('userBilling/store', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setBilling(response.data));
  }
};

const getInvoices = (params) => async (dispatch) => {
  const { searchState, userId } = params;

  const requestParam = {
    settings: {
      sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ accountId: userId }] } }],
      config: {
        invoices: {
          currentPage: searchState.pagination.page,
          pageSize: searchState.pagination.rowsPerPage,
        },
      },
      orders: [{ field: searchState.sort.sortBy, type: searchState.sort.sortDir }],
    },
  };

  const response = await serviceApi.requestData('userInvoice/find', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setInvoices(response));
  }
};

const getPlans = (params) => async (dispatch) => {
  const { userId } = params;

  const requestParamPlan = {
    settings: {
      sources: [{ source: 'bool|must', type: 'term', nested: true, fields: [{ _id: userId }] }],
      config: { plans: { currentPage: 0, pageSize: 10 } },
      orders: [],
    },
  };

  const response = await serviceApi.requestData('userPlan/find', 'POST', requestParamPlan);

  if (response.success) {
    dispatch(slice.actions.setPlans(response));
  }
};

const getTeams = (params) => async (dispatch) => {
  const { searchState, userId } = params;

  const requestParam = {
    settings: {
      sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ _id: userId }] } }],
      config: {
        teams: {
          currentPage: searchState.pagination.page,
          pageSize: searchState.pagination.rowsPerPage,
        },
      },
    },
  };

  const response = await serviceApi.requestData('userTeam/find', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setTeams(response));
  }
};

const saveTeam = (params) => async (dispatch) => {
  const { userId, sysNotification, email = null, status, owerAccountId = null, memberId = null } = params;

  const requestParam = {
    params: { accountId: userId, owerAccountId, email, sysNotification },
    body: [{ id: memberId || '', accountId: memberId ? userId : '', status }],
    settings: {},
  };

  const response = await serviceApi.requestData('userTeam/store', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.saveTeam({ team: response.data[0], memberId }));
  }
};

const delTeam = (params) => async (dispatch) => {
  const { userId, items, memberUserId } = params;

  const requestParam = {
    params: { accountId: userId, deleteIds: items, memberUserId },
    body: {},
    settings: {},
  };
  const response = await serviceApi.requestData('userTeam/delete', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.delTeam(items.map((item) => item.id)));
  }
};

const getLoginEvents = (params) => async (dispatch) => {
  const { searchState, userId } = params;

  const requestParam = {
    settings: {
      sources: [{ source: 'bool|must', filter: { type: 'term', fields: [{ accountId: userId }] } }],
      config: {
        loginevent: {
          currentPage: searchState.pagination.page,
          pageSize: searchState.pagination.rowsPerPage,
        },
      },
      orders: [{ field: searchState.sort.sortBy, type: searchState.sort.sortDir }],
    },
  };

  const response = await serviceApi.requestData('userLoginEvent/find', 'POST', requestParam);

  if (response.success) {
    dispatch(slice.actions.setLoginEvents(response));
  }
};

export const thunks = {
  getUsers,
  getUser,
  updateUser,
  saveUser,
  getMembersTeam,
  getAddresses,
  saveAddress,
  delAddress,
  getBilling,
  saveBilling,
  getInvoices,
  getPlans,
  getTeams,
  saveTeam,
  delTeam,
  getLoginEvents,
};
