import { stat, readFile, writeFile } from 'node:fs/promises';

export async function optimizeSvg(inputPath, outputPath) {
  const svgContents = await readFile(inputPath, 'utf8');
  const optimizedSvg = processSvg(svgContents);
  await writeFile(outputPath, optimizedSvg);
  const originalSize = await readFileSize(inputPath);
  const optimizedSize = await readFileSize(outputPath);
  const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2);
  console.log(`Original SVG size: ${originalSize} bytes`);
  console.log(`Optimized SVG size: ${optimizedSize} bytes`);
  console.log(`Saved: ${savings}% (${originalSize - optimizedSize} bytes)`);
}

async function readFileSize(filePath) {
  const fileStats = await stat(filePath);
  return fileStats.size;
}

function processSvg(svg) {
  return svg
    // Remove XML declaration
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    // Remove DOCTYPE
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove `standalone="no"`
    .replace(/\sstandalone="no"/g, '')
    // Remove `id` attributes
    .replace(/\sid="[^"]*"/g, '')
    // Replace absolute width/height with viewBox only for responsive scaling
    .replace(/width="[^"]*"\s*height="[^"]*"\s*viewBox="([^"]*)"/g, 'viewBox="$1"')
    // Simplify 0.x numbers to .x in path data
    .replace(/(\s|,)0\.(\d+)/g, '$1.$2')
    // Round decimals to 2 places
    .replace(/(\d+\.\d{2})\d+/g, '$1')
    // Normalize all whitespace to single spaces (remove newlines)
    .replace(/\s+/g, ' ')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Compact whitespace within path data (very careful not to break structure)
    .replace(/d="([^"]*)"/g, (_match, pathData) => {
      const normalizedData = pathData
        .replace(/\s+/g, ' ') // Normalize all whitespace to single spaces
        .replace(/([A-Za-z])\s+/g, '$1') // Remove space after commands (M, L, C, etc.)
        .trim(); // Remove leading/trailing spaces
      return `d="${normalizedData}"`;
    })
    // Trim trailing/leading whitespaces
    .trim();
}
