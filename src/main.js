import getPixels from "./modules/get-pixels";
import { RGBAToRaw, toImageData } from "./modules/convert-pixels";

const $ = document.querySelector.bind(document);

//===================================//
//           Basic Loader            //
//===================================//

const loader = (function() {
    const el = $(".loader");

    return {
        start() {
            el.classList.add("animate");
            el.classList.remove("hidden");
        },
        stop() {
            el.classList.add("hidden");
            setTimeout(() => {
                el.classList.remove("animate");
            }, 100);
        }
    }
})();

//===================================//
//          Filter Functions         //
//===================================//

const mainCanvas = $("#main-canvas");
const ctx = mainCanvas.getContext("2d");

let imageData = null;
let imageEffect = null;

import pixelate from "./filters/pixelate";
import pointillize from "./filters/pointillize";

const filters = {
    none: imgData => imgData,
    pixelate,
    pointillize
};

function applyFilter(imageData, filter) {
    return new Promise((resolve, reject) => {
        if (filters[filter]) {
            const start = Date.now();
            const filtered = filters[filter](imageData);
            const filterApplied = Date.now();

            toImageData(filtered).then(data => {
                const preDraw = Date.now();

                mainCanvas.width = data.width;
                mainCanvas.height = data.height;
                ctx.putImageData(data, 0, 0, 0, 0, data.width, data.height);

                console.log(`Applied filter in ${ filterApplied - start }ms, converted to ImageData in ${ preDraw - filterApplied }ms, and drew to canvas in ${ Date.now() - preDraw }ms. Total time ${ Date.now() - start }ms.`);

                resolve();
            });
        } else {
            reject(new Error(`Filter "${ filter }" not found!`));
        }
    });
}

//===================================//
//         DOM Interactivity         //
//===================================//

$(".ersatz-file-chooser .file-chooser").addEventListener("click", e => {
    $(".ersatz-file-chooser .actual-file-chooser").click();
});

$(".ersatz-file-chooser .actual-file-chooser").addEventListener("change", e => {
    loader.start();

    const fileNameText = $(".ersatz-file-chooser .file-name");
    const file = e.target.files[0];

    if (/^image\//.test(file.type)) {
        let size;
        if (file.size / 1024 > 1024) {
            size = `${ Math.round(file.size / 1024 / 1024) } MB`;
        } else {
            size = `${ Math.round(file.size / 1024) } KB`;
        }

        let fileName = file.name.length > 20 ? `${ file.name.substr(0, 20) }...` : file.name;

        // Load it.
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement("img");
            img.file = file;
            img.src = e.target.result;
            
            getPixels(img).then(data => {
                imageData = data;

                fileNameText.textContent = `${ fileName } (${ data.width }x${ data.height } - ${ size })`;
                fileNameText.setAttribute("title", file.name);

                applyFilter(imageData, imageEffect || "none")
                    .then(() => loader.stop())
                    .catch(err => {
                        throw err;
                    });
            });
        };
        reader.onerror = function(err) {
            fileNameText.textContent = err.message;
            loader.stop();
        };
        reader.readAsDataURL(file);

    } else {
        fileNameText.textContent = "That's not a picture!";
        loader.stop();
    }
});

$(".sidebar").addEventListener("click", e => {
    if (e.target && e.target.classList.contains("sidebar-nav-item")) {
        const effect = e.target.getAttribute("data-effect");

        $(".nav-item--selected").classList.remove("nav-item--selected");
        e.target.classList.add("nav-item--selected");

        imageEffect = effect;
        if (imageData) {
            applyFilter(imageData, effect)
                .then(() => {
                    loader.stop();
                })
                .catch(err => {
                    throw err;
                });
        }
    }
});