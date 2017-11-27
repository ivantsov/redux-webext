import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createUIStore} from '../../../../lib';
import App from './app';

async function initApp() {
    const store = await createUIStore();

    const mountNode = document.createElement('div');
    document.body.appendChild(mountNode);

    ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>,
        mountNode
    );
}

initApp();
