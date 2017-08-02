import BackgroundStore from './background-store';
import BackgroundStoreSafari from './background-store-safari';
import UIStore from './ui-store';
import UIStoreSafari from './ui-store-safari';
import declareSafariSendMessage from './utils/declareSafariSendMessage';

let backgroundStore = BackgroundStore;
let uiStore = UIStore;

try {
    if (chrome !== undefined) {
        backgroundStore = BackgroundStore;
        uiStore = UIStore;
    }
}
catch (e) {
    declareSafariSendMessage();
    backgroundStore = BackgroundStoreSafari;
    uiStore = UIStoreSafari;
}

export {backgroundStore as createBackgroundStore};
export {uiStore as createUIStore};
