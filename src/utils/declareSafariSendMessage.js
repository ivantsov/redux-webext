import generateUUID from './generateUUID';

export default function declareSafariSendMessage() {
    safari.extension.globalPage.contentWindow.callbacks = {};
    safari.extension.globalPage.contentWindow.sendMessage = function (message, callback) {
        const msg = message;

        // Prepare for callback
        msg.response = generateUUID();
        safari.extension.globalPage.contentWindow.callbacks[msg.response] = callback;

        window.addEventListener('message', event => {
            if (safari.extension.globalPage.contentWindow.callbacks.hasOwnProperty(event.data.name)
                && safari.extension.globalPage.contentWindow.callbacks[event.data.name] !== undefined) {
                safari.extension.globalPage.contentWindow.callbacks[event.data.name](event.data);
                delete safari.extension.globalPage.contentWindow.callbacks[event.data.name];
            }
        }, false);

        safari.extension.globalPage.contentWindow.postMessage(msg, '*');
    };
}
