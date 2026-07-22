import { readdir } from 'node:fs/promises';
import path from 'node:path';

const heroImageDirectory = path.join(
  process.cwd(),
  'public',
  'images',
  'Landing-Page-Hero-Section',
);
const supportedImageExtension = /\.(avif|gif|jpe?g|png|webp)$/i;

/**
 * Reads the public hero-image directory so adding a new image to it makes the
 * image available in the landing carousel on the next server render.
 */
export async function getLandingHeroSlides(): Promise<string[]> {
  try {
    const entries = await readdir(heroImageDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && supportedImageExtension.test(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
      .map((fileName) => `/images/Landing-Page-Hero-Section/${encodeURIComponent(fileName)}`);
  } catch {
    return [];
  }
}
