/* @flow */

import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from './constants';

let listeners = [];
let state;
let onDisconnect;

function handleMessage(msg: Object): void {
    if (msg.type === UPDATE_STATE) {
        state = msg.data;

        listeners.forEach(l => l());
    }
}

function handleDisconnect(): void {
    if (onDisconnect) {
        onDisconnect();
    }
}

function subscribe(listener: EmptyFunc): EmptyFunc {
    listeners.push(listener);

    // return unsubscribe function
    return function () {
        listeners = listeners.filter(l => l !== listener);
    };
}

function dispatch(action: any): void {
    // perform an action to change state of "background" store
    chrome.runtime.sendMessage({
        type: DISPATCH,
        action
    });
}

function getState(): Object {
    return state;
}

export default function (options?: {
    onDisconnect?: EmptyFunc,
} = {}): Promise<Store> {
    if (options.hasOwnProperty('onDisconnect') && typeof options.onDisconnect !== 'function') {
        return Promise.reject(new Error('Expected the "onDisconnect" to be a function.'));
    }

    onDisconnect = options.onDisconnect;

    // connect to "background" store
    const connection = chrome.runtime.connect({name: CONNECTION_NAME});

    // listen for changes in the "background" store
    connection.onMessage.addListener(handleMessage);

    connection.onDisconnect.addListener(handleDisconnect);

    // return promise to allow getting current state of "background" store
    return new Promise(resolve => {
        chrome.runtime.sendMessage({type: UPDATE_STATE}, res => {
            state = res;

            // return an object with equivalent to Redux store interface
            resolve({
                subscribe,
                dispatch,
                getState
            });
        });
    });
}
