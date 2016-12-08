import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

export const SESSION_ACTIONS = {
    SET_SESSION: 'SET_SESSION',
    CLEAR_SESSION: 'CLEAR_SESSION',
    CLEAR_USER: 'CLEAR_USER',
};

export interface SessionState {
    sessionId: string;
    token: string;
    user: any;
    institutions: any[];
    entitlements: string[];
    tokenExpires: Date;
    ipaddr: string;
};

const initialState: SessionState = {
    sessionId: null,
    token: null,
    user: null,
    institutions: [],
    entitlements: [],
    tokenExpires: null,
    ipaddr: null,
};

export function isTokenExpired(session: SessionState, offsetSeconds?: number): boolean {
    if (session.token !== null) {
        offsetSeconds = offsetSeconds || 0;
        return !(session.tokenExpires.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    } else {
        return true;
    }
}

export function isValidSession(session: SessionState) {
    return !isTokenExpired(session);
}

export function isUserAuthenticated(session: SessionState, offsetSeconds?: number) {
    return (session.user !== null && session.token !== null) ? !isTokenExpired(session, offsetSeconds) : false;
}


export function sessionReducer (state = initialState, action: Action): SessionState {
    switch (action.type) {

        case SESSION_ACTIONS.SET_SESSION:
            return action.payload;

        case SESSION_ACTIONS.CLEAR_SESSION:
            return initialState;

        case SESSION_ACTIONS.CLEAR_USER:
            return (<any>Object).assign({}, state, {user: null});

        default:
            return state;

    }
}
