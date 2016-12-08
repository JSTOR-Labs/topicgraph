import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

export const UI_ACTIONS = {
    SET_MENU_VISIBLE: 'SET_MENU_VISIBLE',
    SET_MENU_HIDDEN: 'SET_MENU_HIDDEN',
    SET_MENU_OPEN: 'SET_MENU_OPEN',
    SET_MENU_CLOSED: 'SET_MENU_CLOSED',
    SET_CURRENT_PATH: 'SET_CURRENT_PATH',
    SET_BUSY: 'SET_BUSY',
    CLEAR_BUSY: 'CLEAR_BUSY',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB'
};

export interface UIState {
    menuVisible: boolean;
    menuOpen: boolean;
    curPath: string;
    priorPath: string;
    tabset: string;
    activeTab: number;
    environment: string;
    context: string;
    busy: boolean;
    busyMessage: string;
};

const initialState: UIState = {
    menuVisible: true,
    menuOpen: false,
    priorPath: '',
    curPath: '',
    tabset: null,
    activeTab: -1,
    environment: ENV,
    context: typeof window !== 'undefined' ? 'browser' : 'server',
    busy: false,
    busyMessage: ''
};

export function uiReducer (state = initialState, action: Action): UIState {
    switch (action.type) {

        case UI_ACTIONS.SET_MENU_VISIBLE:
            return (<any>Object).assign({}, state, { menuVisible: true });

        case UI_ACTIONS.SET_MENU_HIDDEN:
            return (<any>Object).assign({}, state, { menuOpen: false, menuVisible: false });

        case UI_ACTIONS.SET_MENU_OPEN:
            return (<any>Object).assign({}, state, { menuOpen: true });

        case UI_ACTIONS.SET_MENU_CLOSED:
            return (<any>Object).assign({}, state, { menuOpen: false });

        case UI_ACTIONS.SET_CURRENT_PATH:
            return (<any>Object).assign({}, state, { curPath: action.payload, priorPath:state.curPath });

        case UI_ACTIONS.SET_BUSY: 
            return (<any>Object).assign({}, state, { busy: true, busyMessage: action.payload || '' });

        case UI_ACTIONS.CLEAR_BUSY:
            return (<any>Object).assign({}, state, { busy: false, busyMessage: '' });

        case UI_ACTIONS.SET_ACTIVE_TAB:
            return (<any>Object).assign({}, state, action.payload);

        default:
            return state;

    }
}
