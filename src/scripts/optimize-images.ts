import { optimizePublicImages } from '../lib/imageOptimizer';

async function run() {
  console.log('Starting image optimization...');
  await optimizePublicImages();
  console.log('Image optimization complete.');
}

run().catch(error => {
  console.error('Image optimization failed:', error);
  process.exit(1);
});
