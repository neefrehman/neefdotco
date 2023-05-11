/* eslint-disable no-console */
import * as fs from "fs";
import { promisify } from "util";
import ATCQ from "atcq";
import sharp from "sharp";
import rawGetPixels from "get-pixels";

const getPixels = promisify(rawGetPixels);

const rawPhotosDirectory = "./src/photos/_raw";
const cacheJsonFile = "./src/data/quantized-photo-colors.json";

const rawPhotos = fs.readdirSync(rawPhotosDirectory).filter(name => name !== ".DS_Store");
const processedPhotos = JSON.parse(fs.readFileSync(cacheJsonFile));

const photosToDelete = Object.keys(processedPhotos).filter(file => !rawPhotos.includes(file));
const photosToProcess = rawPhotos.filter(
  photoName => !Object.keys(processedPhotos).includes(photoName)
);

const updateCache = () => fs.writeFileSync(cacheJsonFile, JSON.stringify(processedPhotos, null, 4));

const deleteRemovedPhotos = () => {
  console.log(`photos that have been removed: ${photosToDelete}`, "\n");

  photosToDelete.forEach(photo => {
    if (fs.existsSync(`./src/photos/large/${photo}`)) {
      fs.unlinkSync(`./src/photos/large/${photo}`);
      console.log(`deleted ${photo}`, "\n");
    }
    delete processedPhotos[photo];
    updateCache();
  });
};

const updateFileExtension = file => {
  let newFile = file;
  if (file.includes(".jpeg" || file.includes(".JPG"))) {
    console.log(`renaming extension for ${file}`);
    newFile = file.replace("jpeg", "jpg").replace("JPG", "jpg");
    fs.renameSync(`${rawPhotosDirectory}/${file}`, `${rawPhotosDirectory}/${newFile}`);
  }
  return newFile;
};

const extractColorFromImage = async file => {
  const rgb2hex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const atcq = ATCQ({
    maxColors: 8,
    disconnects: false,
    maxIterations: 5,
  });

  const smallPhotoBuffer = await sharp(`${rawPhotosDirectory}/${file}`)
    .resize({ width: 100 })
    .toBuffer();

  const { data: pixelData } = await getPixels(smallPhotoBuffer, "image/jpg");
  atcq.addData(pixelData);
  await atcq.quantizeAsync();

  const colorRgb = atcq.getWeightedPalette(1)[0].color;
  const [colorHex] = rgb2hex(...colorRgb).split(".");
  console.log(`${file} color is: `, colorHex, "\n");

  return colorHex;
};

const resizeImage = async file => {
  await sharp(`${rawPhotosDirectory}/${file}`)
    .resize({ width: 1920 })
    .withMetadata()
    .toFile(`${rawPhotosDirectory}/../large/${file}`);
};

const processPhotos = async () => {
  for (const file of photosToProcess) {
    const newFile = updateFileExtension(file);
    const extractedColor = await extractColorFromImage(newFile);
    processedPhotos[file] = extractedColor;
    updateCache();

    // Also resize the photos so that they aren't too big to check into the repo, or for Astro to process
    await resizeImage(`${rawPhotosDirectory}/${file}`);
  }
};

const main = () => {
  if (photosToDelete.length > 0) {
    deleteRemovedPhotos();
  }

  if (photosToProcess.length === 0) {
    console.log("🙌🏾 no new photos to process 🙌🏾");
    return;
  }

  console.log(`starting processing for ${photosToProcess.length} new photos`);
  processPhotos()
    .then(() => console.log("✨ 🖼  done with photo processing 🖼  ✨", "\n"))
    .catch(error => console.log("error:", error));
};

main();
