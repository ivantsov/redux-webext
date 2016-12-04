import {INCREMENT_UI_COUNTER, DECREMENT_UI_COUNTER} from '../constants';

export function incrementUICounter() {
    return {
        type: INCREMENT_UI_COUNTER,
        value: 3
    };
}

export function decrementUICounter() {
    return {
        type: DECREMENT_UI_COUNTER,
        value: 3
    };
}
