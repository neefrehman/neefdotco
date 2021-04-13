import fs, { readdirSync } from "fs";
import { promisify } from "util";
import { exec as rawExec } from "child_process";
import ATCQ from "atcq";
import rawGetPixels from "get-pixels";
import chalk from "chalk";

const exec = promisify(rawExec);
const getPixels = promisify(rawGetPixels);

const widths = {
    lg: 1800,
    md: 1200,
    sm: 620
};

const rawPhotosDirectory = "./photos/_raw";
const rawPhotos = fs
    .readdirSync("./photos/_raw")
    .filter((name) => name !== ".DS_Store");

const cacheJsonFile = "./scripts/process-photos_cache.json";
const processedPhotos = JSON.parse(fs.readFileSync(cacheJsonFile));

const photosToProcess = rawPhotos.filter(
    (photoName) => !Object.keys(processedPhotos).includes(photoName)
);
const photosToDelete = Object.keys(processedPhotos).filter(
    (file) => !rawPhotos.includes(file)
);

const updateCache = () =>
    fs.writeFileSync(cacheJsonFile, JSON.stringify(processedPhotos, null, 4));


const deleteRemovedPhotos = () => {
    console.log(`photos that have been removed: ${photosToDelete}`, "\n");

    photosToDelete.forEach((photo) => {
        Object.keys(widths).forEach((sizeName) => {
            if (fs.existsSync(`./photos/${sizeName}/${photo}`)) {
                fs.unlinkSync(`./photos/${sizeName}/${photo}`);
                console.log(`deleted ${photo} from photos/${sizeName}`, "\n");
            }
        });
        
        delete processedPhotos[photo];
        updateCache();
    });
};

const resizeAndOptimiseImage = async ({
    imageSource,
    outputDirectory,
    desiredWidth
}) => {
    console.log(`Resizing ~${imageSource}~ for ~${desiredWidth}px~`);
    await exec(
        `squoosh-cli --mozjpeg --max-optimizer-rounds 2 --resize '{"enabled":true, "width":${desiredWidth}}' --rotate '{"enabled":false}' --output-dir ${outputDirectory} ${imageSource}`
    )
        .then(({ stdout, stderr }) => console.log(stdout, stderr))
        .catch((err) => console.log(err));
};

const extractColourFromImage = async (file) => {
    console.log(`starting to extract colours from ${file}`, "\n");

    const rgb2hex = (r, g, b) =>
        "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    const atcq = ATCQ({
        maxColors: 8,
        disconnects: false,
        maxIterations: 5
    });

    const { data: pixelData } = await getPixels(`./photos/sm/${file}`);
    atcq.addData(pixelData);
    await atcq.quantizeAsync();

    const colourRgb = atcq.getWeightedPalette(1)[0].color;
    const colourHex = rgb2hex(...colourRgb).split(".")[0];
    console.log(`${file} colour is: `, chalk.bgHex(colourHex)(colourHex), "\n");
    
    return colourHex;
};

const updateFileExtension = (file) => {
    let newFile = file;
    if (file.includes("jpeg")) {
        newFile = file.replace("jpeg", "jpg");
        console.log(`renaming extension for ${file}`);
        fs.renameSync(
            `${rawPhotosDirectory}/${file}`,
            `${rawPhotosDirectory}/${newFile}`
        );
    }
    return newFile;
}

const processPhotos = async () => {
    console.log(`starting processing for ${photosToProcess.length} new photos`);

    for (const file of photosToProcess) {
        const newFile = updateFileExtension(file);

        for (const [sizeName, width] of Object.entries(widths)) {
            await resizeAndOptimiseImage({
                imageSource: `${rawPhotosDirectory}/${newFile}`,
                outputDirectory: `./photos/${sizeName}`,
                desiredWidth: width
            });
        }

        const extractedColour = await extractColourFromImage(newFile);
        processedPhotos[file] = extractedColour;

        updateCache();
    }
};


const createSrcset = (filename) =>
    Object.entries(widths)
        .map(([sizeName, width]) => `photos/${sizeName}/${filename} ${width}w`)
        .join(", ");

const transparentPng64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const createImageElement = (filename) =>
    `<img class="grid" src="${transparentPng64}" data-srcset="${createSrcset(
        filename
    )}" style="background-color: ${processedPhotos[filename]}"></img>`;

const buildHtmlPage = () => {
    const photosPagePath = "./photos.html";
    const previousPhotosPageMarkup = fs.readFileSync(photosPagePath, "utf-8");
    const photosContainerElementRegex = /<main class="grid photo-container">(.*?)<\/main>/gs;

    console.log("starting to rebuild photos html page", "\n");

    fs.writeFileSync(
        photosPagePath,
        previousPhotosPageMarkup.replace(
            photosContainerElementRegex,
            `<main class="grid photo-container">
            ${rawPhotos.map((filename) => createImageElement(filename)).join("\n")}
        </main>`
        ),
        "utf-8"
    );
    console.log("📑 done rebuilding photos html page 📑");
};

// EXECUTE
const main = () => {
    if (photosToDelete.length > 0) {
        deleteRemovedPhotos();
        buildHtmlPage();
    }

    if (photosToProcess.length === 0) {
        console.log("no new photos to process :~)");
    } else {
        processPhotos(photosToProcess)
            .then(() => console.log("✨ 🖼  done with photo processing 🖼  ✨", "\n"))
            .then(() => buildHtmlPage())
            .catch((error) => console.log("error:", error))
            .finally(() => updateCache());
    }
};

main();
