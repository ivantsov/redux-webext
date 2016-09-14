import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from './constants';

let store, actions, onDisconnect;

// eslint-disable-next-line consistent-return
function handleMessage(msg, sender, cb) {
    if (msg.type === DISPATCH) {
        const actionData = msg.data;
        const action = actions[actionData.type];

        if (action) {
            action(actionData.data);
        }
        else {
            console.error(`Provided in background store "actions" object doesn't contain "${actionData.type}" key.`);
        }
    }
    else if (msg.type === UPDATE_STATE) {
        cb(store.getState());

        // keep channel open, https://developer.chrome.com/extensions/runtime#event-onMessage
        return true;
    }
}

// allow other parts of the app to reuse the store, e.g. popup
function handleConnection(connection) {
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

export default function createBackgroundStore(options = {}) {
    if (typeof options.store !== 'object') {
        throw new Error('Expected the "store" to be an object.');
    }

    if (options.hasOwnProperty('actions') && typeof options.actions !== 'object') {
        throw new Error('Expected the "actions" to be an object.');
    }

    if (options.hasOwnProperty('onDisconnect') && typeof options.onDisconnect !== 'function') {
        throw new Error('Expected the "onDisconnect" to be a function.');
    }

    store = options.store;
    actions = options.actions;
    onDisconnect = options.onDisconnect;

    chrome.runtime.onConnect.addListener(handleConnection);
    chrome.runtime.onMessage.addListener(handleMessage);

    return store;
}
