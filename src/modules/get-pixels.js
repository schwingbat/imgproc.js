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

import { rawToRGBA } from "./convert-pixels";

export default function getPixels(img) {
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
                return resolve({
                    width: img.width,
                    height: img.height,
                    pixels: px
                });
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
}