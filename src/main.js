import getPixels from "./modules/get-pixels";
import { RGBAToRaw } from "./modules/convert-pixels";

const start = Date.now();
getPixels.asRGB("testpic.jpg").then(px => {
    console.log(px);
    console.log(`Got pixels in RGB format in ${ Date.now() - start } ms.`);
});