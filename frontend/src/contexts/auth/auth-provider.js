import { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { AuthContext, initialState } from './auth-context';
import { removeToken, getToken } from 'src/helpers/local-store';
import { jwtSecrets } from 'src/helpers/jwt-secrets';
import { serviceApi } from 'src/services/service-api';

var ActionType;
(function (ActionType) {
  ActionType['INITIALIZE'] = 'INITIALIZE';
  ActionType['SIGN_IN'] = 'SIGN_IN';
  ActionType['SIGN_UP'] = 'SIGN_UP';
  ActionType['SIGN_OUT'] = 'SIGN_OUT';
})(ActionType || (ActionType = {}));

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SIGN_IN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  SIGN_UP: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: false,
      user,
    };
  },
  SIGN_OUT: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      if (!!getToken()) {
        const response = await serviceApi.requestData('auth/loginWithToken', 'POST');

        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: response.data,
          },
        });

        if (!window.location.pathname.includes('chat') && response.data.inChat) {
          const params = { inChat: false };
          await updateUser(params, response.data.id);
        }
      } else {
        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      removeToken();

      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (params) => {
      params.password = jwtSecrets.dataToToken({ password: params.password });

      const requestParam = {
        params: { email: params.email, password: params.password },
        body: params.login,
        settings: {},
      };

      const response = await serviceApi.requestData('auth', 'POST', requestParam);

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: response.data,
        },
      });
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (body, bodyEmail) => {
      body.password = jwtSecrets.dataToToken({ password: body.password });

      const requestParam = {
        params: { email: body.email, password: body.password, bodyEmail },
        body,
        settings: {},
      };

      await serviceApi.requestData('user/register', 'POST', requestParam);

      dispatch({
        type: ActionType.SIGN_UP,
        payload: {
          user: null,
        },
      });
    },
    [dispatch]
  );

  const verify = useCallback(
    async (params) => {
      const requestParam = {
        params: { verifyCode: params.verifyCode, token: params.token },
        body: {},
        settings: {},
      };

      await serviceApi.requestData('auth/verify', 'POST', requestParam);

      dispatch({
        type: ActionType.SIGN_UP,
        payload: {
          user: null,
        },
      });
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    removeToken();

    dispatch({
      type: ActionType.SIGN_OUT,
    });
  }, [dispatch]);

  const changePassword = useCallback(
    async (accountId, password, bodyEmail) => {
      const requestParam = {
        params: { accountId, bodyEmail, update: true },
        body: { password: jwtSecrets.dataToToken({ password }) },
        settings: {},
      };

      const response = await serviceApi.requestData('auth/changePassword', 'POST', requestParam);

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: response.data,
        },
      });
    },
    [dispatch]
  );

  const forgotPassword = useCallback(
    async (params, bodyEmail) => {
      const requestParam = {
        params: { email: params.email, bodyEmail },
        body: {},
        settings: {},
      };
      await serviceApi.requestData('auth/forgotPassword', 'POST', requestParam);

      dispatch({ type: ActionType.SIGN_OUT });
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (params, userId) => {
      if (params.teams) {
        params.teams = { id: params.teams.id, name: params.teams.name };
      }
      const requestParam = {
        params: { accountId: userId, update: true },
        body: params,
        settings: {},
      };

      const response = await serviceApi.requestData('user/store', 'POST', requestParam);

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: response.data,
        },
      });
    },
    [dispatch]
  );

  const setUser = useCallback(
    async (user) => {
      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          user,
        },
      });
    },
    [dispatch]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        verify,
        forgotPassword,
        changePassword,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
