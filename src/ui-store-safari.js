/* @flow */

import {
    DISPATCH,
    UPDATE_STATE
} from './constants';

let listeners = [];
let state;

const safariCallback = {};

function handleMessage(msg: Object): void {
    if (msg.type === UPDATE_STATE) {
        state = msg.state;

        listeners.forEach(l => l());
    }
}

const sendSafariMessage = function (message, callback) {
    const generateUUID = function () {
        const dec2hex = [];

        for (let i = 0; i <= 15; i += 1) {
            dec2hex[i] = i.toString(16);
        }
        let uuid = '';
        for (let i = 1; i <= 36; i += 1) {
            if (i === 9 || i === 14 || i === 19 || i === 24) {
                uuid += '-';
            }
            else if (i === 15) {
                uuid += 4;
            }
            else if (i === 20) {
                uuid += dec2hex[(Math.random() * 4 | 0 + 8)];
            }
            else {
                uuid += dec2hex[(Math.random() * 15 | 0)];
            }
        }
        return uuid;
    };

    const msg = message;

    // Prepare for callback
    msg.response = generateUUID();
    safariCallback[msg.response] = callback;

    window.addEventListener('message', event => {
        if (safariCallback.hasOwnProperty(event.data.name)
                && safariCallback[event.data.name] !== undefined) {
            handleMessage(event.data);

            safariCallback[event.data.name](event.data.state);
            safariCallback[event.data.name] = null;
        }
    }, false);

    safari.extension.globalPage.contentWindow.postMessage(msg, '*');
};

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
        sendSafariMessage({type: UPDATE_STATE, response: ''}, res => {
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
