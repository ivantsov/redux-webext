global.window.addEventListener = jest.fn();
global.window.safari = {
    extension: {
        globalPage: {
            contentWindow: {
                postMessage: jest.fn(),
                sendMessage: jest.fn()
            }
        },
        popovers: [{
            contentWindow: {
                postMessage: jest.fn()
            }
        }]
    }
};
global.window.chrome = {
    runtime: {
        onConnect: {
            addListener: jest.fn()
        },
        onMessage: {
            addListener: jest.fn()
        }
    }
};