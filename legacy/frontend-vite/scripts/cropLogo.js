import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cropLogo() {
  const inputBlack = path.join(__dirname, '../public/logo-black.png');
  const inputWhite = path.join(__dirname, '../public/logo-white.png');
  
  // Trim whitespace/background automatically
  await sharp(inputBlack)
    .trim({ threshold: 10 })
    .toFile(path.join(__dirname, '../public/logo-black-cropped.png'));
    
  await sharp(inputWhite)
    .trim({ threshold: 10 })
    .toFile(path.join(__dirname, '../public/logo-white-cropped.png'));
    
  console.log('✓ Logos cropped successfully');
}

cropLogo();
