import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from '../src/constants';
import createUIStore from '../src/ui-store';

async function createStore(state) {
    const connection = {
        onMessage: {
            addListener: jest.fn()
        }
    };

    window.chrome = {
        runtime: {
            connect: jest.fn(() => connection),
            sendMessage: jest.fn()
        }
    };

    const promise = createUIStore();

    expect(chrome.runtime.connect).lastCalledWith({name: CONNECTION_NAME});
    expect(connection.onMessage.addListener).lastCalledWith(jasmine.any(Function));
    expect(chrome.runtime.sendMessage).lastCalledWith({type: UPDATE_STATE}, null, jasmine.any(Function));

    chrome.runtime.sendMessage.mock.calls[0][2](state);

    const store = await promise;

    expect(store).toEqual({
        subscribe: jasmine.any(Function),
        dispatch: jasmine.any(Function),
        getState: jasmine.any(Function)
    });

    return {
        store,
        onMessageHandler: connection.onMessage.addListener.mock.calls[0][0]
    };
}

describe('ui-store', () => {
    it('works', async () => {
        await createStore();
    });

    it('dispatch', async () => {
        const action = {
            type: 'ACTION',
            data: 'test'
        };
        const {store} = await createStore();

        store.dispatch(action);

        expect(chrome.runtime.sendMessage).lastCalledWith({
            type: DISPATCH,
            action
        });
    });

    describe('subscribe', async () => {
        async function createTestCase() {
            const {store, onMessageHandler} = await createStore();

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const unsubscribe1 = store.subscribe(listener1);
            const unsubscribe2 = store.subscribe(listener2);

            onMessageHandler({
                type: UPDATE_STATE,
                data: 'test1'
            });

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

            onMessageHandler({
                type: UPDATE_STATE,
                data: 'test2'
            });

            expect(listener1.mock.calls.length).toBe(2);
            expect(listener2.mock.calls.length).toBe(2);
        });


        it('wrong message type', async () => {
            const {
                onMessageHandler,
                listener1,
                listener2
            } = await createTestCase();

            onMessageHandler({
                type: 'some weird type',
                data: 'test2'
            });

            expect(listener1.mock.calls.length).toBe(1);
            expect(listener2.mock.calls.length).toBe(1);
        });

        it('unsubscribe', async () => {
            const {
                onMessageHandler,
                listener1,
                listener2,
                unsubscribe1,
                unsubscribe2
            } = await createTestCase();

            unsubscribe1();

            onMessageHandler({
                type: UPDATE_STATE,
                data: 'test2'
            });

            expect(listener1.mock.calls.length).toBe(1);
            expect(listener2.mock.calls.length).toBe(2);

            unsubscribe2();

            expect(listener1.mock.calls.length).toBe(1);
            expect(listener2.mock.calls.length).toBe(2);
        });
    });

    it('getState', async () => {
        const initialState = {test1: 'test1'};
        const {
            store,
            onMessageHandler
        } = await createStore(initialState);

        expect(store.getState()).toBe(initialState);

        const newState = {
            test1: 'test2',
            test3: 'test3'
        };
        onMessageHandler({
            type: UPDATE_STATE,
            data: newState
        });
        expect(store.getState()).toBe(newState);

        onMessageHandler({type: UPDATE_STATE});
        expect(store.getState()).toBeUndefined();
    });
});
