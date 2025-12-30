const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const commonConfig = {
  bundle: true,
  minify: false, // Set true for production
  sourcemap: true,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: { 'process.env.NODE_ENV': '"development"' },
};

async function build() {
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  const contexts = [
    // Build Popup
    await esbuild.context({
      ...commonConfig,
      entryPoints: ['popup/index.tsx'],
      outfile: 'dist/popup.js',
    }),
    // Build Content Script
    await esbuild.context({
      ...commonConfig,
      entryPoints: ['content.tsx'],
      outfile: 'dist/content.js',
    }),
    // Build Background Script
    await esbuild.context({
      ...commonConfig,
      entryPoints: ['background.ts'],
      outfile: 'dist/background.js',
    }),
  ];

  if (isWatch) {
    await Promise.all(contexts.map(ctx => ctx.watch()));
    console.log('👀 Watching for changes...');
  } else {
    await Promise.all(contexts.map(ctx => ctx.rebuild()));
    await Promise.all(contexts.map(ctx => ctx.dispose()));
    console.log('✅ Build complete!');
  }
}

build().catch(() => process.exit(1));