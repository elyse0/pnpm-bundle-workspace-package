import { Project } from '@pnpm/types';
import path from 'path';

import { argsParser } from '@/util/args-parser.js';
import { Workspace } from '@/util/Workspace.js';
import { PackageBundler } from '@/util/PackageBundler.js';

// https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope
import { fileURLToPath } from 'url';

const main = async () => {
    const argParserOptions = argsParser.opts();

    if (!argsParser.processedArgs[0]) {
        throw Error('Target package name or path is required');
    }

    const targetPackageNameOrPath = argsParser.processedArgs[0];

    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);

    const workspaceRootDir = Workspace.getRootDir(dirname);
    const workspacePackages = await Workspace.getPackages(workspaceRootDir);

    const workspace = new Workspace(workspaceRootDir, workspacePackages);

    let targetPackage: Project | null = workspace.tryToResolvePackage(targetPackageNameOrPath);
    if (!targetPackage) {
        throw Error("Couldn't find target package inside workspace");
    }

    const packageBundler = new PackageBundler(
        workspace,
        targetPackage,
        argParserOptions.outDir,
    );

    packageBundler.createDistFolder();
    packageBundler.copyTargetPackageFiles();
    packageBundler.copyTargetPackageWorkspaceDependencies();
};

main().then(() => {
});
