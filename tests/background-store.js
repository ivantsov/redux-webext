import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from '../src/constants';
import createBackgroundStore from '../src/background-store';

function createStore(params) {
    window.chrome = {
        runtime: {
            onConnect: {
                addListener: jest.fn()
            },
            onMessage: {
                addListener: jest.fn()
            }
        }
    };

    return {
        store: createBackgroundStore({
            store: {
                dispatch: jest.fn()
            },
            ...params
        }),
        handleConnect: chrome.runtime.onConnect.addListener.mock.calls[0][0],
        handleMessage: chrome.runtime.onMessage.addListener.mock.calls[0][0]
    };
}

describe('background-store', () => {
    describe('invalid params', () => {
        it('no params', () => {
            expect(createBackgroundStore).toThrowError(/store/);
        });

        it('no store or not an object', () => {
            expect(() => createBackgroundStore()).toThrowError(/store/);
            expect(() => createBackgroundStore({store: true})).toThrowError(/store/);
        });

        it('actions is not an object', () => {
            expect(() => createBackgroundStore({
                store: {},
                actions: true
            })).toThrowError(/actions/);
        });

        it('onDisconnect is not an object', () => {
            expect(() => createBackgroundStore({
                store: {},
                onDisconnect: true
            })).toThrowError(/onDisconnect/);
        });
    });

    it('returns the same store', () => {
        const store = {
            prop1: 'prop1',
            prop2: 'prop2'
        };

        expect(createStore({store}).store).toBe(store);
    });

    describe('handle connection', () => {
        function testCase(onDisconnect) {
            const unsubscribe = jest.fn();
            const options = {
                store: {
                    subscribe: jest.fn(() => unsubscribe),
                    getState: jest.fn()
                }
            };

            if (onDisconnect) {
                options.onDisconnect = onDisconnect;
            }

            const {store, handleConnect} = createStore(options);
            const connection = {
                name: CONNECTION_NAME,
                postMessage: jest.fn(),
                onDisconnect: {
                    addListener: jest.fn()
                }
            };

            handleConnect(connection);

            expect(store.subscribe).lastCalledWith(jasmine.any(Function));
            expect(connection.onDisconnect.addListener).lastCalledWith(jasmine.any(Function));

            store.subscribe.mock.calls[0][0]();

            expect(store.getState).lastCalledWith();
            expect(connection.postMessage).lastCalledWith({
                type: UPDATE_STATE,
                data: store.getState()
            });

            return {
                store,
                unsubscribe,
                connection
            };
        }

        it('dont handle connection with other names', () => {
            const {handleConnect} = createStore();
            const connection = {
                name: 'test',
                onDisconnect: {
                    addListener: jest.fn()
                }
            };

            handleConnect(connection);

            expect(connection.onDisconnect.addListener).not.toBeCalled();
        });

        it('on change event', () => {
            testCase();
        });

        describe('on disconnect', () => {
            it('without provided onDisconnect callback', () => {
                const {
                    unsubscribe,
                    connection
                } = testCase();

                // onDisconnect
                connection.onDisconnect.addListener.mock.calls[0][0]();

                expect(unsubscribe).lastCalledWith();
            });

            it('with provided onDisconnect callback', () => {
                const onDisconnect = jest.fn();
                const {
                    unsubscribe,
                    connection
                } = testCase(onDisconnect);

                // onDisconnect
                connection.onDisconnect.addListener.mock.calls[0][0]();

                expect(unsubscribe).lastCalledWith();
                expect(onDisconnect).lastCalledWith();
            });
        });
    });

    describe('handle message', () => {
        describe('dispatch', () => {
            it('the action does not exist', () => {
                const {handleMessage} = createStore({actions: {}});
                const actionName = 'fake';

                window.console.error = jest.fn();

                handleMessage({
                    type: DISPATCH,
                    action: {
                        type: actionName
                    }
                });

                expect(window.console.error).lastCalledWith(`Provided in background store "actions" object doesn't contain "${actionName}" key.`);
            });

            describe('the action exists', () => {
                function testCase(actionData) {
                    const action = {
                        type: 'load',
                        ...actionData
                    };
                    const actionResult = 456;
                    const actions = {
                        [action.type]: jest.fn(() => actionResult)
                    };
                    const {store, handleMessage} = createStore({actions});

                    window.console.error = jest.fn();

                    handleMessage({
                        type: DISPATCH,
                        action
                    });

                    expect(actions[action.type]).lastCalledWith(actionData);
                    expect(store.dispatch).lastCalledWith(actionResult);
                    expect(window.console.error).not.toBeCalled();
                }

                it('action data is empty', () => {
                    testCase();
                });

                it('action data is just an object', () => {
                    testCase({value: 123});
                });

                it('action data is a nested object', () => {
                    testCase({
                        obj: {
                            value1: 123
                        },
                        value2: 456
                    });
                });
            });
        });

        it('update state', () => {
            const {store, handleMessage} = createStore({store: {
                getState: jest.fn()
            }});
            const callback = jest.fn();

            const result = handleMessage({type: UPDATE_STATE}, null, callback);

            expect(result).toBe(true);
            expect(store.getState).lastCalledWith();
            expect(callback).lastCalledWith(store.getState());
        });
    });
});
