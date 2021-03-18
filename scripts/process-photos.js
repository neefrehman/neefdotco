import fs, { readdirSync } from "fs";
import { promisify } from "util";
import { exec as rawExec } from "child_process";
import ATCQ from "atcq";
import rawGetPixels from "get-pixels";
import chalk from "chalk";

const exec = promisify(rawExec);
const getPixels = promisify(rawGetPixels);

const widths = { lg: 1800, md: 1200, sm: 620 };

const rawPhotosDirectory = "./photos/_raw";
const rawPhotos = fs
    .readdirSync("./photos/_raw")
    .filter((name) => name !== ".DS_Store");

const cacheJsonFile = "./scripts/process-photos_cache.json";
const processedPhotos = JSON.parse(fs.readFileSync(cacheJsonFile));
const photosToProcess = rawPhotos.filter(
    (photoName) => !Object.keys(processedPhotos).includes(photoName)
);

const deleteRemovedPhotos = () => {
    const photosToDelete = Object.keys(processedPhotos).filter(
        (file) => !rawPhotos.includes(file)
    );

    if (photosToDelete.length === 0) {
        return;
    }

    console.log(`photos that have been removed: ${photosToDelete}`);

    photosToDelete.forEach((photo) => {
        console.log(`deleting: ${photo}`);
        Object.keys(widths).forEach((sizeName) => {
            if (fs.existsSync(`./photos/${sizeName}/${photo}`)) {
                fs.unlinkSync(`./photos/${sizeName}/${photo}`);
            }
        });
        delete processedPhotos[photo];
        fs.writeFileSync(cacheJsonFile, JSON.stringify(processedPhotos, null, 4));
    });
};

const resizeAndOptimiseImage = async ({
    imageSource,
    outputDirectory,
    desiredWidth
}) => {
    console.log(`Resizing ~${imageSource}~ for ~${desiredWidth}px~`);
    await exec(
        `squoosh-cli --mozjpeg --max-optimizer-rounds 2 --resize '{"enabled":true, "width":${desiredWidth}}' --output-dir ${outputDirectory} ${imageSource}`
    )
        .then(({ stdout, stderr }) => console.log(stdout, stderr))
        .catch((err) => console.log(err));
};

const rgb2hex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const extractColourFromImage = async (file) => {
    console.log(`starting to extract colours from ${file}`, "\n");
    const atcq = ATCQ({
        maxColors: 8,
        disconnects: false,
        maxIterations: 5
    });

    const { data } = await getPixels(`./photos/sm/${file}`);
    atcq.addData(data);
    await atcq.quantizeAsync();

    const colourRgb = atcq.getWeightedPalette(1)[0].color;
    const colourHex = rgb2hex(...colourRgb).split(".")[0];

    console.log(`${file} colour is: `, chalk.bgHex(colourHex)(colourHex), "\n");
    return colourHex;
};

const processPhotos = async (photos) => {
    console.log(`starting processing for ${photos.length} new photos`, "\n");

    for (const file of photos) {
        for (const [sizeName, width] of Object.entries(widths)) {
            await resizeAndOptimiseImage({
                imageSource: `${rawPhotosDirectory}/${file}`,
                outputDirectory: `./photos/${sizeName}`,
                desiredWidth: width
            });
        }

        const extractedColour = await extractColourFromImage(file);
        processedPhotos[file] = extractedColour;

        fs.writeFileSync(cacheJsonFile, JSON.stringify(processedPhotos, null, 4));
    }
};

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
    )}" style="background-color: ${processedPhotos[filename]}"></img>`;

const buildHtmlPage = () => {
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

const main = () => {
    deleteRemovedPhotos();

    if (photosToProcess.length === 0) {
        console.log("no new photos to process :~)");
    } else {
        processPhotos(photosToProcess)
            .then(() => console.log("✨ 🖼  done with photo processing 🖼  ✨", "\n"))
            .catch((error) => console.log("error", error))
            .finally(() => buildHtmlPage());
    }
};

main();
