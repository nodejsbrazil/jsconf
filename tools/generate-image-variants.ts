/**
 * Writes the responsive width variants that the shared `Image` wrapper points its
 * `srcset` at. Run it whenever an image under `sources` is added or replaced:
 *
 *   npm run images
 *
 * The output is committed. It could just as well hang off a `prebuild` hook, but
 * then every entry point that serves the site (`npm run build`, three `npm start`
 * locales, a bare `docusaurus start`) would need its own hook to stay honest, and
 * dev would silently 404 the moment one was missed. Committed files are the same
 * files everywhere, with nothing to fire.
 *
 * Existing outputs that are newer than their source are left alone, so re-running
 * after a single image change costs almost nothing.
 *
 * `sharp` arrives through Docusaurus rather than our own package.json. That is
 * fine precisely because this script is manual: if a Docusaurus upgrade ever drops
 * it, the failure lands here in front of whoever is swapping an image, not in the
 * middle of a deploy.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { candidates, isVariant } from '../src/website/configs/images';

/** Docusaurus `staticDirectories` root: `<root>/img/x.webp` is served as `/img/x.webp`. */
const assets = 'src/website/assets';

/** Everything the `Image` wrapper renders. Directories are expanded one level. */
const sources = [
  'img/logotype.png',
  'img/venue.webp',
  'img/community',
  'img/partners',
  'img/team',
];

const isSource = (path: string) =>
  /\.(webp|png|jpe?g)$/i.test(path) && !isVariant(path);

const expand = (source: string) => {
  const path = join(assets, source);
  if (!statSync(path).isDirectory()) return [source];
  return readdirSync(path)
    .filter(isSource)
    .map((entry) => join(source, entry));
};

/**
 * Lossless for PNG sources and lossy for the rest. The only PNG here is a
 * wordmark, where lossless came out both smaller and pixel-exact; the WebP
 * sources are already lossy, so a lossless re-encode would only spend bytes
 * preserving their existing artefacts.
 */
const encoderFor = (source: string) =>
  source.endsWith('.png')
    ? { lossless: true, effort: 6 }
    : { quality: 80, effort: 6 };

const isUpToDate = (output: string, source: string) => {
  try {
    return statSync(output).mtimeMs >= statSync(source).mtimeMs;
  } catch {
    return false;
  }
};

const generate = async () => {
  const written: string[] = [];
  const skipped: string[] = [];

  for (const source of sources.flatMap(expand)) {
    const sourcePath = join(assets, source);
    const { width } = await sharp(sourcePath).metadata();
    if (!width) throw new Error(`${source}: could not read an intrinsic width`);

    for (const candidate of candidates(`/${source}`, width)) {
      // The full-size candidate of a WebP source *is* the source.
      if (candidate.path === `/${source}`) continue;

      const outputPath = join(assets, candidate.path);
      if (isUpToDate(outputPath, sourcePath)) {
        skipped.push(candidate.path);
        continue;
      }

      await sharp(sourcePath)
        .resize({ width: candidate.width, withoutEnlargement: true })
        .webp(encoderFor(source))
        .toFile(outputPath);
      written.push(candidate.path);
    }
  }

  console.info(
    `image variants: ${written.length} written, ${skipped.length} already up to date`
  );
  for (const path of written) console.info(`  + ${path}`);
};

void generate();
