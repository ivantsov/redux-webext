/* @flow */

import {
    DISPATCH,
    UPDATE_STATE
} from './constants';

let listeners = [];
let state;

function handleMessage(msg: Object): void {
    if (msg.type === UPDATE_STATE) {
        state = msg.state;

        listeners.forEach(l => l());
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
    safari.extension.globalPage.contentWindow.postMessage({
        type: DISPATCH,
        action
    }, '*');
}

function getState(): Object {
    return state;
}

export default function (): Promise<Store> {
    window.addEventListener('message', event => {
        handleMessage(event.data);
    }, false);

    // return promise to allow getting current state of "background" store
    return new Promise(resolve => {
        safari.extension.globalPage.contentWindow.sendMessage({type: UPDATE_STATE, response: ''}, res => {
            if (res !== undefined) {
                handleMessage(res);

                state = res.state;
            }

            // return an object with equivalent to Redux store interface
            resolve({
                subscribe,
                dispatch,
                getState
            });
        });
    });
}
