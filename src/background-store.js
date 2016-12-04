/* @flow */

import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from './constants';

let store, actions, onDisconnect;

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

    // send updated state to other parts of the app on every change
    const unsubscribe = store.subscribe(() => {
        connection.postMessage({
            type: UPDATE_STATE,
            data: store.getState()
        });
    });

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
    onDisconnect?: EmptyFunc
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

    store = options.store;
    actions = options.actions || {};
    onDisconnect = options.onDisconnect;

    chrome.runtime.onConnect.addListener(handleConnection);
    chrome.runtime.onMessage.addListener(handleMessage);

    return store;
}
