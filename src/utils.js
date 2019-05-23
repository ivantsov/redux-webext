/* @flow */

const debounce = (func: (...args: any) => void, delay: number) => {
    let inDebounce;
    return function (...args: any) {
        const context: any = this;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
};

export default {debounce};
