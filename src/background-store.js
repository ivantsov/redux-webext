/* @flow */

import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from './constants';

import utils from './utils';

let store, actions, onDisconnect, debounceDelay;

// eslint-disable-next-line consistent-return
function handleMessage(
    msg: Object,
    sender: ?string,
    cb: (res: any) => void
): ?boolean {
    if (msg.type === DISPATCH) {
        const {type, ...actionData} = msg.action;
        const action = actions[type];

        if (action) {
            // if action doesn't have any data we should pass "undefined"
            store.dispatch(action(Object.keys(actionData).length ? actionData : undefined));
        }
        else {
            console.error(`Provided in background store "actions" object doesn't contain "${type}" key.`);
        }
    }
    else if (msg.type === UPDATE_STATE) {
        cb(store.getState());

        // keep channel open, https://developer.chrome.com/extensions/runtime#event-onMessage
        return true;
    }
}

// allow other parts of the app to reuse the store, e.g. popup
function handleConnection(connection: Connection): void {
    if (connection.name !== CONNECTION_NAME) {
        return;
    }

    let onStoreEvent = () => {
        connection.postMessage({
            type: UPDATE_STATE,
            data: store.getState()
        });
    };

    if (debounceDelay) {
        onStoreEvent = utils.debounce(onStoreEvent, debounceDelay);
    }

    // send updated state to other parts of the app on every change
    const unsubscribe = store.subscribe(onStoreEvent);

    // unsubscribe on disconnect
    connection.onDisconnect.addListener(() => {
        unsubscribe();

        if (onDisconnect) {
            onDisconnect();
        }
    });
}

export default function createBackgroundStore(options: {
    store: Store,
    actions?: Object,
    onDisconnect?: EmptyFunc,
    debounceDelay?: number
}): Store {
    if (typeof options !== 'object' || typeof options.store !== 'object') {
        throw new Error('Expected the "store" to be an object.');
    }

    if (options.hasOwnProperty('actions') && typeof options.actions !== 'object') {
        throw new Error('Expected the "actions" to be an object.');
    }

    if (options.hasOwnProperty('onDisconnect') && typeof options.onDisconnect !== 'function') {
        throw new Error('Expected the "onDisconnect" to be a function.');
    }

    if (options.hasOwnProperty('debounceDelay') && typeof options.debounceDelay !== 'number') {
        throw new Error('Expected the "debounceDelay" to be a number');
    }

    store = options.store;
    actions = options.actions || {};
    onDisconnect = options.onDisconnect;
    debounceDelay = options.debounceDelay;

    chrome.runtime.onConnect.addListener(handleConnection);
    chrome.runtime.onMessage.addListener(handleMessage);

    return store;
}
