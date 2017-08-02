import {
    DISPATCH,
    UPDATE_STATE
} from '../src/constants';
import createBackgroundStore from '../src/background-store-safari';

function createStore(params) {
    window.addEventListener = jest.fn();

    return {
        store: createBackgroundStore({
            store: {
                dispatch: jest.fn(),
                subscribe: jest.fn()
            },
            ...params
        }),
        handleMessage: window.addEventListener.mock.calls[0][1]
    };
}

describe('background-store-safari', () => {
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
            prop2: 'prop2',
            subscribe: jest.fn()
        };

        expect(createStore({store}).store).toBe(store);
    });

    describe('handle message', () => {
        describe('dispatch', () => {
            it('the action does not exist', () => {
                const {handleMessage} = createStore({actions: {}});
                const actionName = 'fake';

                window.console.error = jest.fn();

                handleMessage({data: {
                    type: DISPATCH,
                    action: {
                        type: actionName
                    }
                }});

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

                    handleMessage({data: {
                        type: DISPATCH,
                        action
                    }});

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
                getState: jest.fn(),
                subscribe: jest.fn()
            }});

            const result = handleMessage({data: {
                type: UPDATE_STATE
            }});

            expect(result).toBe(true);
            expect(store.getState).lastCalledWith();
        });
    });
});
