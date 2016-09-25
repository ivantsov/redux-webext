import {combineReducers} from 'redux';
import {
    INCREMENT_BACKGROUND_COUNTER,
    DECREMENT_BACKGROUND_COUNTER,
    INCREMENT_UI_COUNTER,
    DECREMENT_UI_COUNTER
} from '../constants';

function createCounterReducer(increment, decrement) {
    return function (state = 0, action) {
        switch (action.type) {
            case increment:
                return state + 1;
            case decrement:
                return state - 1;
            default:
                return state;
        }
    }
}

export default combineReducers({
    backgroundCounter: createCounterReducer(INCREMENT_BACKGROUND_COUNTER, DECREMENT_BACKGROUND_COUNTER),
    uiCounter: createCounterReducer(INCREMENT_UI_COUNTER, DECREMENT_UI_COUNTER)
});
