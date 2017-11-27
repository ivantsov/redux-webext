import BackgroundStore from './background-store';
import BackgroundStoreSafari from './background-store-safari';
import UIStore from './ui-store';
import UIStoreSafari from './ui-store-safari';
import declareSafariSendMessage from './utils/declareSafariSendMessage';
import addObjectAssignPolyfill from './utils/object-assign-safari-polyfill';

addObjectAssignPolyfill();

let backgroundStore = BackgroundStore;
let uiStore = UIStore;


if (typeof chrome !== 'undefined') {
    backgroundStore = BackgroundStore;
    uiStore = UIStore;
}
else if (typeof safari !== 'undefined') {
    declareSafariSendMessage();
    backgroundStore = BackgroundStoreSafari;
    uiStore = UIStoreSafari;
}

export {backgroundStore as createBackgroundStore};
export {uiStore as createUIStore};
