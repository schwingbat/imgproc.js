(function () {
'use strict';

/**
 * convert-pixels.js
 * -----------------
 * Converts to and from the raw 1D RGBA format
 * that getImageData spits out. This makes understanding
 * the data just a bit easier.
 */

function rawToRGBA(px) {
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

/**
 * get-pixels.js
 * -------------
 * Uses a Canvas element to load and grab
 * pixel data from a specified image.
 * 
 * Relies on global 'document' being available
 * so it will only work in the browser.
 * If needed, it could be slightly modified
 * to work with something like node-canvas.
 */

function getPixels(img) {
    return new Promise((resolve, reject) => {
        if (typeof img === "string") {
            if (typeof document !== "undefined") {
                const imgStr = img;
                img = document.createElement("img");
                img.src = imgStr;
            } else {
                throw new Error("Unable to create image element as 'document' is undefined.");
            }
        } else if (img instanceof HTMLImageElement) {
            // Do nothing. That's fine.
        } else {
            throw new Error("Invalid image format. Must be a string or HTMLImageElement.");
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.addEventListener("load", e => {
            // Image has loaded. Draw it to canvas and grab the pixels.

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            if (px instanceof Uint8ClampedArray) {
                return resolve(px);
            } else {
                return reject(new Error("Pixel data couldn't be read."));
            }
        });

        img.addEventListener("error", err => {
            reject(err);
        });
    });
}

getPixels.asRGB = function asRGB(img) {
    return new Promise((resolve, reject) => {
        this(img)
            .then(rawToRGBA)
            .then(resolve)
            .catch(reject);
    });
};

const start = Date.now();
getPixels.asRGB("testpic.jpg").then(px => {
    console.log(px);
    console.log(`Got pixels in RGB format in ${ Date.now() - start } ms.`);
});

}());
