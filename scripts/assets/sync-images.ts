/**
 * scripts/assets/sync-images.ts
 *
 * Download core WebP assets from your server to local `public/images/modules`.
 * Usage: npm run images:sync
 * Optional env: FP_IMAGES_BASE=https://fitprove.app/images/modules/
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const BASE = process.env.FP_IMAGES_BASE || "https://fitprove.app/images/modules/";
const OUT_DIR = path.resolve(process.cwd(), "public/images/modules");

const files = [
  "hero.webp",
  "loginpage.webp",
  "workout.webp",
  "workout-generator.webp",
  "stretching.webp",
  "recovering.webp",
  "mindset.webp",
  "food.webp",
  "badges.webp",
  "water.webp",
];

fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          file.close();
          fs.rmSync(dest, { force: true });
          return reject(new Error(`${res.statusCode} ${res.statusMessage} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", (err) => {
        file.close();
        fs.rmSync(dest, { force: true });
        reject(err);
      });
  });
}

async function main() {
  console.log(`Syncing images from ${BASE} -> ${OUT_DIR}`);
  for (const name of files) {
    const url = `${BASE}${name}`;
    const dest = path.join(OUT_DIR, name);
    try {
      await download(url, dest);
      console.log(`✔ ${name}`);
    } catch (e: any) {
      console.warn(`⚠ Skip ${name}: ${e?.message || e}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

