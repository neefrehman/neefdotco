import * as fs from "node:fs/promises";
import path from "node:path";

import ATCQ from "atcq";
import sharp from "sharp";

const appDirectory = path.join(import.meta.dirname, "..");
const rawPhotosDirectory = path.join(appDirectory, "src/photos/_raw");
const largePhotosDirectory = path.join(appDirectory, "src/photos/large");
const cacheJsonFile = path.join(appDirectory, "src/data/quantized-photo-colors.json");

const JPEG_EXTENSION = /\.jpe?g$/i;

const processedPhotos = JSON.parse(await fs.readFile(cacheJsonFile, "utf-8"));

const writeCache = async () => {
  const sortedCache = Object.fromEntries(
    Object.entries(processedPhotos).sort(([a], [b]) => (a < b ? -1 : 1)),
  );
  await fs.writeFile(cacheJsonFile, `${JSON.stringify(sortedCache, null, 4)}\n`);
};

// Raw photos are named `.jpg` from here on, renaming any `.jpeg` or `.JPG` files on disk
const rawPhotos = [];
for (const name of await fs.readdir(rawPhotosDirectory)) {
  if (!JPEG_EXTENSION.test(name)) {
    continue;
  }
  const normalisedName = name.replace(JPEG_EXTENSION, ".jpg");
  if (normalisedName !== name) {
    console.log(`renaming extension for ${name}`);
    await fs.rename(
      path.join(rawPhotosDirectory, name),
      path.join(rawPhotosDirectory, normalisedName),
    );
  }
  rawPhotos.push(normalisedName);
}

const rawPhotoSet = new Set(rawPhotos);
const photosToDelete = Object.keys(processedPhotos).filter((name) => !rawPhotoSet.has(name));
const photosToProcess = rawPhotos.filter((name) => !(name in processedPhotos));

const extractColor = async (name) => {
  // Colour extraction doesn't need much detail, so we use a small version of the photo
  const { data: pixels } = await sharp(path.join(rawPhotosDirectory, name))
    .resize({ width: 100 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const atcq = ATCQ({ maxColors: 8, disconnects: false, maxIterations: 5 });
  atcq.addData(pixels);
  await atcq.quantizeAsync();

  const { color } = atcq.getWeightedPalette(1)[0];
  return `#${color.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
};

// So that the photos aren't too big to check into the repo, or for Astro to process
const resizePhoto = (name) =>
  sharp(path.join(rawPhotosDirectory, name))
    .rotate() // apply the EXIF orientation, so that the width we resize to is the displayed width
    .resize({ width: 1920 })
    .toFile(path.join(largePhotosDirectory, name)); // metadata (e.g. location) is dropped by default

if (photosToDelete.length === 0 && photosToProcess.length === 0) {
  console.log("🙌🏾 no new photos to process 🙌🏾");
  process.exit(0);
}

try {
  if (photosToDelete.length > 0) {
    console.log(`photos that have been removed: ${photosToDelete}`, "\n");
  }
  for (const name of photosToDelete) {
    await fs.rm(path.join(largePhotosDirectory, name), { force: true });
    delete processedPhotos[name];
    console.log(`deleted ${name}`, "\n");
  }

  if (photosToProcess.length > 0) {
    console.log(`starting processing for ${photosToProcess.length} new photos`);
  }
  for (const name of photosToProcess) {
    const color = await extractColor(name);
    await resizePhoto(name);
    processedPhotos[name] = color;
    console.log(`${name} color is: `, color, "\n");
  }
  console.log("✨ 🖼  done with photo processing 🖼  ✨", "\n");
} finally {
  // Keep the progress made so far if a photo fails, so that we don't redo the photos before it
  await writeCache();
}
