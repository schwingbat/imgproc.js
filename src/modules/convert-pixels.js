/**
 * convert-pixels.js
 * -----------------
 * Converts to and from the raw 1D RGBA format
 * that getImageData spits out. This makes understanding
 * the data just a bit easier.
 */

export function rawToRGBA(px) {
    return new Promise((resolve, reject) => {
        const rgba = [];

        let subIndex = 1;
        let pixel = {};

        for (let i = 0; i < px.length; i++) {
            switch (subIndex) {
            case 1:
                pixel.r = px[i];
                subIndex = 2;
                break;
            case 2:
                pixel.g = px[i];
                subIndex = 3;
                break;
            case 3:
                pixel.b = px[i];
                subIndex = 4;
                break;
            case 4:
                pixel.a = px[i];
                subIndex = 1;
                rgba.push(pixel);
                pixel = {};
                break;
            default:
                throw new Error(`subIndex is an unexpected value (${ subIndex }) at index ${ i }`);
            }
        }

        return resolve(rgba);
    });
}

export function RGBAToRaw(px) {
    return new Promise((resolve, reject) => {
        const raw = [];

        for (let i = 0; i < px.length; i++) {
            raw.push(px[i].r, px[i].g, px[i].b, px[i].a);
        }

        return resolve(raw);
    });
}