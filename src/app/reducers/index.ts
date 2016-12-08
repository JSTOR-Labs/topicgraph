import { compose } from '@ngrx/core/compose';
import { ActionReducer, combineReducers } from '@ngrx/store';
// import { storeFreeze } from 'ngrx-store-freeze';
import { storeLogger } from 'ngrx-store-logger';
import { routerReducer, RouterState } from '@ngrx/router-store';

import * as fromSession from './session.reducer';
import * as fromUI from './ui.reducer';
import * as fromTopicgraphs from './topicgraphs.reducer';

export { SESSION_ACTIONS, isTokenExpired, isValidSession, isUserAuthenticated } from './session.reducer';
export { TOPICGRAPHS_ACTIONS } from './topicgraphs.reducer';

export interface AppState {
  router: RouterState;
  session: fromSession.SessionState;
  ui: fromUI.UIState;
  topicgraphs: fromTopicgraphs.TopicgraphsState;
}

export const reducers = {
  router: routerReducer,
  session: fromSession.sessionReducer,
  ui: fromUI.uiReducer,
  topicgraphs: fromTopicgraphs.topicgraphsReducer
};

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    if (action.type === 'SET_ROOT_STATE') {
      return action.payload;
    }
    return reducer(state, action);
  };
}

//const DEV_REDUCERS = [stateSetter, storeFreeze];
const DEV_REDUCERS = [stateSetter];
if (['logger', 'both'].includes(STORE_DEV_TOOLS)) { // set in constants.js file of project root
    DEV_REDUCERS.push(storeLogger());
}

const developmentReducer = compose(...DEV_REDUCERS, combineReducers)(reducers);
const productionReducer = compose(combineReducers)(reducers);

export function rootReducer(state: any, action: any) {
  if (ENV !== 'development') {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}
