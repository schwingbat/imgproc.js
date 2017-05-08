const filters = {
    none: function(imgData) {
        return imgData;
    },
    pixelate: function(imgData, res = 64) {
        const ratio = imgData.width / res;

        const xSize = imgData.width / ratio;
        const ySize = imgData.height / ratio;

        console.log(xSize, ySize);

        const blocks = [];
        const { data } = imgData;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(Math.random() * 128) + 64;
        }

        return imgData;
    }
}

addEventListener("message", e => {
    const start = Date.now();

    const d = e.data.imageData;
    const f = e.data.filter || "none";
    const processed = filters[f]( new ImageData(new Uint8ClampedArray(d.pixels), d.width, d.height) );

    console.log(`Applied filter "${ f }" in ${ Date.now() - start }ms.`);

    this.postMessage(processed);
});