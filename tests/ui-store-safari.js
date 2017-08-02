import {
    DISPATCH,
    UPDATE_STATE
} from '../src/constants';
import createUIStore from '../src/ui-store-safari';

async function createStore(state) {
    window.addEventListener = jest.fn();

    let promise = createUIStore();

    //expect(window.addEventListener).lastCalledWith('message', jasmine.any(Function), false);
    expect(safari.extension.globalPage.contentWindow.sendMessage).lastCalledWith(
        {type: UPDATE_STATE, response: ''},
        jasmine.any(Function)
    );

    safari.extension.globalPage.contentWindow.sendMessage.mock.calls[0][1](state);

    const store = await promise;

    expect(store).toEqual({
        subscribe: jasmine.any(Function),
        dispatch: jasmine.any(Function),
        getState: jasmine.any(Function)
    });

    return {
        store,
        onMessageHandler: window.addEventListener.mock.calls[0][1]
    };
}

describe('ui-store-safari', () => {
    it('works', async () => {
        await createStore();
    });

    it('dispatch', async () => {
        const action = {state: {
            type: 'ACTION',
            data: 'test'
        }};
        const {store} = await createStore();

        store.dispatch(action);

        expect(safari.extension.globalPage.contentWindow.postMessage).lastCalledWith({
            type: DISPATCH,
            action
        }, '*');
    });

    describe('subscribe', async () => {
        async function createTestCase() {
            const {store, onMessageHandler} = await createStore();

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const unsubscribe1 = store.subscribe(listener1);
            const unsubscribe2 = store.subscribe(listener2);

            onMessageHandler({data: {
                type: UPDATE_STATE,
                state: 'test1'
            }});

            expect(listener1.mock.calls.length).toBe(1);
            expect(listener2.mock.calls.length).toBe(1);

            return {
                onMessageHandler,
                listener1,
                listener2,
                unsubscribe1,
                unsubscribe2
            };
        }

        it('correct message type', async () => {
            const {
                onMessageHandler,
                listener1,
                listener2
            } = await createTestCase();

            onMessageHandler({data: {
                type: UPDATE_STATE,
                state: 'test2'
            }});

            expect(listener1.mock.calls.length).toBe(2);
            expect(listener2.mock.calls.length).toBe(2);
        });


        it('wrong message type', async () => {
            const {
                onMessageHandler,
                listener1,
                listener2
            } = await createTestCase();

            onMessageHandler({data: {
                type: 'some weird type',
                state: 'test2'
            }});

            expect(listener1.mock.calls.length).toBe(1);
            expect(listener2.mock.calls.length).toBe(1);
        });
    });

    it('getState', async () => {
        const initialState = {state: {test1: 'test1'}};
        const {
            store,
            onMessageHandler
        } = await createStore(initialState);

        expect(store.getState()).toBe(initialState.state);

        const newState = {state: {
            test1: 'test2',
            test3: 'test3'
        }};
        onMessageHandler({data: {
            type: UPDATE_STATE,
            state: newState.state
        }});
        expect(store.getState()).toBe(newState.state);

        onMessageHandler({data: {type: UPDATE_STATE}});
        expect(store.getState()).toBeUndefined();
    });
});
