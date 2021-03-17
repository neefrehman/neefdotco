import fs, { readdirSync } from "fs";
import { promisify } from "util";
import { exec as rawExec } from "child_process";
import ATCQ from "atcq";
import rawGetPixels from "get-pixels";

const exec = promisify(rawExec);
const getPixels = promisify(rawGetPixels);

const widths = { lg: 1800, md: 1200, sm: 620 };

// IMAGE RESIZING AND OPTIMISATIONS
const rawPhotosDirectory = "./photos/_raw";
const rawPhotos = fs
    .readdirSync("./photos/_raw")
    .filter((name) => name !== ".DS_Store");

const photosToProcess = rawPhotos.filter((photoName) => {
    const previousProcesses = Object.keys(widths).reduce((acc, sizeName) => {
        return acc.concat(readdirSync(`./photos/${sizeName}`).includes(photoName));
    }, []);
    return !previousProcesses.every((size) => size === true);
});

const PROCESSING_CHUNK_SIZE = 5;
const tempPhotosToProcess = photosToProcess.slice();
const chunkedPhotosToProcess = [
    ...Array(Math.ceil(photosToProcess.length / PROCESSING_CHUNK_SIZE))
].map(() => tempPhotosToProcess.splice(0, PROCESSING_CHUNK_SIZE));

const resizeAndOptimiseImages = async ({
    imageSourceArray,
    outputDirectory,
    desiredWidth
}) => {
    console.log(`Resizing images for ${desiredWidth}px`);
    await exec(
        `squoosh-cli --mozjpeg --max-optimizer-rounds 2 --resize '{"enabled":true, "width":${desiredWidth}}' --output-dir ${outputDirectory} ${imageSourceArray.join(
            " "
        )}`
    )
        .then(({ stdout, stderr }) => console.log(stdout, stderr))
        .catch((err) => console.log(err));
};

const processPhotos = async () => {
    console.log(`starting processing for ${photosToProcess.length} new photos`);

    for (const chunk of chunkedPhotosToProcess) {
        for (const [sizeName, width] of Object.entries(widths)) {
            await resizeAndOptimiseImages({
                imageSourceArray: chunk.map(
                    (filename) => `${rawPhotosDirectory}/${filename}`
                ),
                outputDirectory: `./photos/${sizeName}`,
                desiredWidth: width
            });
        }
    }
};

// COLOUR EXTRACTIONM
const rgb2hex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const extractKeyColourFromImage = async (file) => {
    const atcq = ATCQ({
        maxColors: 8,
        disconnects: false,
        maxIterations: 5
    });

    const { data } = await getPixels(`./photos/sm/${file}`);
    atcq.addData(data);
    await atcq.quantizeAsync();

    const colour = atcq.getWeightedPalette(1)[0].color;
    console.log(image);

    return rgb2hex(...palette.color).split(".")[0];
};

const imageColourMap = {};

const extractColours = async () => {
    console.log(`starting to extract colours from photos`);
    for (const file of rawPhotos) {
        const keyColour = await extractKeyColourFromImage(file);
        imageColourMap[file] = keyColour;
    }
};

// STATIC PAGE BUILD
const photosPagePath = "./photos.html";
const previousPhotosPageMarkup = fs.readFileSync(photosPagePath, "utf-8");
const photosContainerElementRegex = /<main class="grid photo-container">(.*?)<\/main>/gs;

const createSrcset = (filename) =>
    Object.entries(widths)
        .map(([sizeName, width]) => `photos/${sizeName}/${filename} ${width}w`)
        .join(", ");

const createImageElement = (filename) =>
    `<img class="grid" loading="lazy" data-srcset="${createSrcset(
        filename
    )}" style="background-color: ${imageColourMap[filename]}"></img>`;

const buildHtmlPage = () => {
    console.log("starting to rebuild photos html page");
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

const main = () => {
    if (photosToProcess.length === 0) {
        console.log("no new photos to process :~)");
    } else {
        processPhotos()
            .then(() => console.log("✨ 🖼  done with photo processing 🖼  ✨"))
            .then(() => extractColours())
            .catch((error) => console.log("error", error))
            .finally(() => buildHtmlPage());
    }
};

main();
