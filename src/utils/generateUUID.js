export default function generateUUID() {
    const dec2hex = [];

    for (let i = 0; i <= 15; i += 1) {
        dec2hex[i] = i.toString(16);
    }
    let uuid = '';
    for (let i = 1; i <= 36; i += 1) {
        if (i === 9 || i === 14 || i === 19 || i === 24) {
            uuid += '-';
        }
        else if (i === 15) {
            uuid += 4;
        }
        else if (i === 20) {
            uuid += dec2hex[(Math.random() * 4 | 0 + 8)];
        }
        else {
            uuid += dec2hex[(Math.random() * 15 | 0)];
        }
    }
    return uuid;
}
