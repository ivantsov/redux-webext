import {createStore} from 'redux';
import {createBackgroundStore} from '../../../../lib';
import {INCREMENT_UI_COUNTER, DECREMENT_UI_COUNTER} from '../constants';
import reducer from './reducers';
import {incrementUICounter, decrementUICounter} from './actions';

const store = createStore(reducer);

export default createBackgroundStore({
    store,
    actions: {
        INCREMENT_UI_COUNTER: incrementUICounter,
        DECREMENT_UI_COUNTER: decrementUICounter
    }
});
