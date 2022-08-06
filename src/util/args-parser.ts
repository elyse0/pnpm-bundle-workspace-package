import { Command } from 'commander';

const argsParser = new Command();

argsParser
    .name('pnpm-bundle-workspace')
    .description('CLI to bundle a single pnpm package')
    .version('1.0.0')
    .argument('[target]', 'Target package name or path', '.')
    .option('--outDir [path]', 'Destination', 'bundled')

argsParser.parse();

export {
    argsParser,
};
