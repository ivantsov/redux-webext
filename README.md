# redux-webext

[![Build Status](https://travis-ci.org/ivantsov/redux-webext.svg?branch=master)](https://travis-ci.org/ivantsov/redux-webext)
[![Coverage Status](https://coveralls.io/repos/github/ivantsov/redux-webext/badge.svg?branch=master)](https://coveralls.io/github/ivantsov/redux-webext?branch=master)

This package allows you to use [Redux](https://github.com/reactjs/redux) for managing the state of your WebExtension.

## Installation

`npm install redux-webext --save`

## Introduction

Usually WebExtension consists of two basic parts:
 
* _background page_, where you store the data and process it somehow
* _UI pages_ (e.g. popup or content scripts), where you show the data from _background page_

<br/>
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1555792/19413626/dd0f33be-9332-11e6-801f-090ffb8eced4.png"/>
</p>
<br/>

As you can see, to provide data between _background_ and _UI_ pages you have to use [messages](https://developer.chrome.com/extensions/messaging). Or... actually, you don't have to, because of `redux-webext`:

<br/>
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1555792/19413725/21031a42-9336-11e6-85ce-d5dc63104936.png"/>
</p>
<br/>

In a nutshell, `redux-webext` takes care of communication between _background_ and _UI_ pages using Redux. But there are 2 key things that you should understand:

* In _background_ page there is Redux store that contains the entire state of your WebExtension. All logic (actions, reducers etc) is placed in _background_ page as well.
* _UI_ pages have access to the state via their own Redux stores, but **there are no real actions or reducers**. I said *real* because _UI_ pages might have functions associated with actions in _background_ page. You can think about it like a proxy that allows you to call _background_ actions from _UI_ pages.

Now let's consider the situations when the state can be changed:

* Something happened in _background_ page. In this case we just call an action as usual in Redux, reducers return a new state and `redux-webext` notifies all stores (_background_ and _UI_ ones) in your WebExtension.
* User interaction in _UI_ page (e.g. user click on a button in popup). Firstly, in _UI_ page we call a function associated with a *real* action in _background_ page. Then `redux-webext` calls the _real_ action and afterwards everything works as in the previous case.

Also there's [tutorial with example](https://github.com/ivantsov/redux-webext/tree/master/examples) where you can find how to use `redux-ext`.

## Examples

* https://github.com/ivantsov/redux-webext/tree/master/examples - an exhaustive tutorial based on a simple extension
* https://github.com/ivantsov/yandex-mail-notifier-chrome - a real extension that uses `redux-webext`

## API

#### `createBackgroundStore(options)` - creates Redux store for _background_ page.

#### Options

- `store` - instance of Redux store.
- `actions` (optional) - object which keys are types of actions in _UI_ page and values are actions in _background_ page.
- `onDisconnect` (optional) - function that will be called on destroying _UI_ store (e.g. right after closing a popup).

Returns the provided `store`.

#### Example

```js
const store = createStore(reducer); // real Redux store

const backgroundStore = createBackgroundStore({
    store,
    actions: {
        // "INCREMENT_UI_COUNTER" is a string that will be used as a type of action in UI page
        // "incrementUICounter" is an action is background page
        INCREMENT_UI_COUNTER: incrementUICounter,
        DECREMENT_UI_COUNTER: decrementUICounter
    }
});
```

#### `createUIStore()` - creates Redux store for _UI_ pages.

Returns `promise` which will be resolved after receiving the current state of _background_ store. And an object with identical to Redux store structure will be passed as resolved result.

#### Example

```js
async function initApp() {
    const store = await createUIStore();

    ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>,
        document.getElementById('app')
    );
}

initApp();
```
