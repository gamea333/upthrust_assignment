import { getImage } from 'astro:assets';
import grid from '../assets/images/grid-dark.webp';

// The warped grid behind services and the footer, as raster images.
// (The original SVG had to be painted on the main thread at full section size,
// which was the single biggest cost on mobile. Rasters decode off-thread.)
// Returns CSS custom properties: --grid-sm (mobile) and --grid-lg (desktop),
// each an image-set with AVIF first and WebP as the fallback.
export async function gridBackgroundVars(): Promise<string> {
  const variant = async (width: number) => {
    const [avif, webp] = await Promise.all([
      getImage({ src: grid, width, format: 'avif', quality: 45 }),
      getImage({ src: grid, width, format: 'webp', quality: 60 }),
    ]);
    return `image-set(url(${avif.src}) type('image/avif'), url(${webp.src}) type('image/webp'))`;
  };

  const [sm, lg] = await Promise.all([variant(1200), variant(2400)]);
  return `--grid-sm: ${sm}; --grid-lg: ${lg};`;
}
