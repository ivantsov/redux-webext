declare type EmptyFunc = () => void;

declare type Connection = {
    name: string,
    postMessage: (msg: any) => void,
    onDisconnect: {
        addListener: (handler: EmptyFunc) => void
    },
    onMessage: {
        addListener: (handler: ((msg: Object) => void)) => void
    }
};

declare type Store = {
    getState: () => Object,
    dispatch: (...args: any) => void,
    subscribe: (listener: EmptyFunc) => EmptyFunc
};
