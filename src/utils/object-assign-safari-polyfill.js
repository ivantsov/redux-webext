
export default function addObjectAssignPolyfill() {
    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, 'assign', {
            value: function assign(target, varArgs) { // eslint-disable-line no-unused-vars
                'use strict'; // eslint-disable-line strict, lines-around-directive

                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                const to = Object(target);

                for (let index = 1; index < arguments.length; index += 1) { // eslint-disable-line prefer-rest-params
                    const nextSource = arguments[index]; // eslint-disable-line prefer-rest-params

                    if (nextSource != null) { // Skip over if undefined or null
                        for (let i = 0; i < nextSource.length; i += 1) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextSource[i])) {
                                to[nextSource[i]] = nextSource[nextSource[i]];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
}
