/**
 * convert-pixels.js
 * -----------------
 * Converts to and from the raw 1D RGBA format
 * that getImageData spits out. This makes understanding
 * the data just a bit easier.
 */

export function rawToRGBA(data) {
    return new Promise((resolve, reject) => {
        const pixels = [];

        let subIndex = 1;
        let pixel = {};

        const px = data.pixels;

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
                pixels.push(pixel);
                pixel = {};
                break;
            default:
                throw new Error(`subIndex is an unexpected value (${ subIndex }) at index ${ i }`);
            }
        }

        return resolve(Object.assign({}, data, { pixels }));
    });
}

export function RGBAToRaw(data) {
    return new Promise((resolve, reject) => {
        const pixels = [];
        const px = data.pixels;

        for (let i = 0; i < px.length; i++) {
            pixels.push(px[i].r, px[i].g, px[i].b, px[i].a);
        }

        return resolve(Object.assign({}, data, { pixels: new Uint8ClampedArray(pixels) }));
    });
}

export function toImageData(data) {
    return new Promise((resolve, reject) => {
        if (data.pixels[0].r) {
            // Is RGBA.
            RGBAToRaw(data).then(raw => {
                resolve(new ImageData(raw.pixels, raw.width, raw.height));
            })
            .catch(reject);
        } else if (data.pixels instanceof Uint8ClampedArray) {
            // Already raw.
            resolve(new ImageData(data.pixels, data.width, data.height));
        } else if (data.pixels instanceof Array) {
            resolve(new ImageData(new Uint8ClampedArray(data.pixels), data.width, data.height));
        } else {
            console.error(data);
            reject(new Error("Unknown type of pixel data."));
        }
    });
}