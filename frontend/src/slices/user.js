import { createSlice } from '@reduxjs/toolkit';
import { orderBy } from 'lodash';

const initialState = {
  user: {},
  billing: {},
  membersTeam: [],
  users: { data: [], info: {} },
  addresses: { data: [], info: {} },
  plans: { data: [], info: {} },
  invoices: { data: [], info: {} },
  teams: { data: [], info: {} },
  loginEvents: { data: [], info: {} },
};

const reducers = {
  setUsers(state, action) {
    const users = action.payload;

    state.users = users;
    state.user = {};
  },
  setUser(state, action) {
    const user = action.payload;

    state.user = user;
  },
  setAddresses(state, action) {
    const addresses = action.payload;

    state.addresses = addresses;
  },
  saveAddress(state, action) {
    const address = action.payload;

    if (address) {
      const addressIdx = state.addresses.data.findIndex((x) => x.id === address.id);

      if (addressIdx !== -1) {
        state.addresses.data[addressIdx] = address;
      } else {
        state.addresses.data.push(address);
      }
      state.addresses.data = orderBy(state.addresses.data, ['main'], ['desc']);
    }
  },
  delAddress(state, action) {
    const items = action.payload;

    state.addresses.data = state.addresses.data.filter((address) => !items.includes(address.id));
  },
  setBilling(state, action) {
    const billing = action.payload;

    state.billing = billing;
  },
  setInvoices(state, action) {
    const invoices = action.payload;

    state.invoices = invoices;
  },
  setPlans(state, action) {
    const plans = action.payload;

    state.plans = plans;
  },
  setTeams(state, action) {
    const teams = action.payload;

    state.teams = teams;
  },
  setMembersTeam(state, action) {
    const { members } = action.payload;

    state.membersTeam = members;
  },
  saveTeam(state, action) {
    const { team, memberId } = action.payload;

    if (team && !memberId) {
      const teamIdx = state.teams.data.findIndex((x) => x.id === team.id);

      if (teamIdx !== -1) {
        state.teams.data[teamIdx] = team;
      } else {
        state.teams.data.unshift(team);
      }
    }
    if (memberId) {
      const memberIdx = state.membersTeam.findIndex((x) => x.memberId === memberId);

      if (memberIdx !== -1) {
        state.membersTeam[memberIdx].status = team.status;
      }
    }
  },
  delTeam(state, action) {
    const items = action.payload;

    state.teams.data = state.teams.data.filter((team) => !items.includes(team.id));
  },
  setLoginEvents(state, action) {
    const loginEvents = action.payload;

    state.loginEvents = loginEvents;
  },
};

export const slice = createSlice({
  name: 'user',
  initialState,
  reducers,
});

export const { reducer } = slice;
