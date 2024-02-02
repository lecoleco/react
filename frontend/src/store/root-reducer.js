import { reducer as userReducer } from 'src/slices/user';

export const rootReducer = combineReducers({
  user: userReducer,
 
});
