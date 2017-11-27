/* @flow */

import {
    DISPATCH,
    UPDATE_STATE
} from './constants';

let store, actions;

function sendSafariMessage(message) {
    safari.extension.popovers.forEach(element => {
        const clonedMessage = Object.assign({}, message);
        element.contentWindow.postMessage(clonedMessage, '*');
    });
}

// eslint-disable-next-line consistent-return
function handleMessage(
    msg: Object
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
        const response = {
            name: msg.response,
            type: msg.type,
            state: store.getState()
        };
        sendSafariMessage(response);
        return true;
    }
}

export default function createBackgroundStore(options: {
    store: Store,
    actions?: Object
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

    window.addEventListener('message', event =>
        handleMessage(event.data)
    );

    // send updated state to other parts of the app on every change
    store.subscribe(() => {
        sendSafariMessage({
            type: UPDATE_STATE,
            state: store.getState()
        });
    });

    return store;
}
