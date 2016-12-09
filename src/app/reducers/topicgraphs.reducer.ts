import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

export const TOPICGRAPHS_ACTIONS = {
    SEARCH_MONOGRAPHS: 'SEARCH_MONOGRAPHS',
    MONOGRAPHS_SEARCH_COMPLETE: 'MONOGRAPHS_SEARCH_COMPLETE',
    RESET_MONOGRAPHS_SEARCH: 'RESET_MONOGRAPHS_SEARCH',
    SET_SELECTED_MONOGRAPH: 'SET_SELECTED_MONOGRAPH',
    CLEAR_SELECTED_MONOGRAPH: 'CLEAR_SELECTED_MONOGRAPH',
    SET_SELECTED_TOPIC: 'SET_SELECTED_TOPIC',
    SET_TOPIC_MAP_ORIENTATION: 'SET_TOPIC_MAP_ORIENTATION',
    SET_TOPIC_WORD_HIGHLIGHTING_ENABLED: 'SET_TOPIC_WORD_HIGHLIGHTING_ENABLED',
    SET_PDF_PAGE: 'SET_PDF_PAGE'
};

export interface TopicgraphsState {
    query: string;
    offset: number;
    numFound: number;
    docs: any[];
    selected: any;
    pdfPage: number;
    topic: string;
    topicNum: number;
    topicMapOrientation: string;
    topicWordHighlightingEnabled: boolean;
    loading: boolean;
};

const initialState: TopicgraphsState = {
    query: '',
    offset: 0,
    numFound: 0,
    docs: [],
    selected: null,
    pdfPage: 1,
    topic: null,
    topicNum: 1,
    topicMapOrientation: 'horizontal',
    topicWordHighlightingEnabled: true,
    loading: false,
};

export function topicgraphsReducer (state = initialState, action: Action): TopicgraphsState {
    switch (action.type) {
        case TOPICGRAPHS_ACTIONS.SEARCH_MONOGRAPHS: {
            return (<any>Object).assign({},
                    initialState, { loading: true,
                                    query: action.payload ? action.payload.query || '' : '',
                                    offset: action.payload ? action.payload.offset || 0 : 0 });
        }

        case TOPICGRAPHS_ACTIONS.MONOGRAPHS_SEARCH_COMPLETE: {
            let docids: string[] = [];
            let aggregated: any[] = [...state.docs];
            state.docs.forEach(doc => docids.push(doc.id));
            action.payload.docs.forEach(doc => {
                if (docids.indexOf(doc.id) < 0) {
                    aggregated.push(doc);
                    docids.push(doc.id);
                }
            });
            return (<any>Object).assign({},
                    state, { loading: false,
                             numFound: aggregated.length,
                             docs: aggregated });
        }

        case TOPICGRAPHS_ACTIONS.RESET_MONOGRAPHS_SEARCH: {
            return initialState;
        }

        case TOPICGRAPHS_ACTIONS.SET_SELECTED_MONOGRAPH: {
            let matches = state.docs.filter(doc => {return doc.id === action.payload;});
            return (<any>Object).assign({}, state, {selected: matches.length === 1 ? matches[0] : null});
        }

        case TOPICGRAPHS_ACTIONS.CLEAR_SELECTED_MONOGRAPH:
            return (<any>Object).assign({}, state, {selected:null});

        case TOPICGRAPHS_ACTIONS.SET_SELECTED_TOPIC:
            return (<any>Object).assign({}, state, { topic:action.payload.topic, topicNum: action.payload.topicNum } );

        case TOPICGRAPHS_ACTIONS.SET_TOPIC_MAP_ORIENTATION:
            return (<any>Object).assign({}, state, { topicMapOrientation: action.payload } );

        case TOPICGRAPHS_ACTIONS.SET_TOPIC_WORD_HIGHLIGHTING_ENABLED:
            return (<any>Object).assign({}, state, { topicWordHighlightingEnabled: action.payload } );

        case TOPICGRAPHS_ACTIONS.SET_PDF_PAGE:
            return (<any>Object).assign({}, state, { pdfPage: action.payload } );

        default: {
            return state;
        }
    }
}
