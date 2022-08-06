import fs, { existsSync, mkdirSync } from 'fs';
import fse, { copySync } from 'fs-extra';
import path from 'path';

import { Project } from '@pnpm/types';

import { TargetPackage } from '@/util/TargetPackage.js';
import { Workspace } from '@/util/Workspace.js';
import { writeJsonFile } from '@/util/json.js';

class PackageBundler {

    workspace: Workspace;
    targetPackage: TargetPackage;

    outDir: string;
    workspaceDependenciesFolder: string = 'workspace-dependencies';

    constructor(workspace: Workspace, targetPackage: Project, outDir: string) {
        this.workspace = workspace;
        this.targetPackage = new TargetPackage(targetPackage, workspace);
        this.outDir = outDir;
    }

    getIgnorePatterns(): string[] {
        return [ 'node_modules', 'package.json', `${this.outDir}` ];
    }

    createDistFolder() {
        if (existsSync(this.outDir)) {
            throw Error(`Dist folder already exists ${this.outDir}`);
            // rmSync(this.distPath, { recursive: true });
        }

        mkdirSync(this.outDir, { recursive: true });
    }

    replaceWorkspaceDependenciesVersions(pkg: Project, relativePath: string): Project {
        if (pkg.manifest.dependencies) {
            Object.keys(pkg.manifest.dependencies).forEach((dependencyName) => {
                const workspacePackage = this.workspace.getPackageByName(dependencyName);
                if (workspacePackage && pkg.manifest.dependencies) {
                    const directoryName = path.basename(workspacePackage.dir);
                    pkg.manifest.dependencies[dependencyName] = `file:${relativePath}/${directoryName}`;
                }
            });
        }

        return pkg;
    }

    copyTargetPackageWorkspaceDependencies() {
        this.targetPackage.workspaceDependencies.forEach((dependency) => {
            const directoryName = path.basename(dependency.dir);
            const distPath = `${this.outDir}/${this.workspaceDependenciesFolder}/${directoryName}`;
            copySync(
                dependency.dir,
                distPath,
                {
                    filter: (src, _) => !this.getIgnorePatterns().some(pattern => src.includes(pattern)),
                },
            );

            dependency = this.replaceWorkspaceDependenciesVersions(dependency, '..');

            writeJsonFile(path.join(distPath, 'package.json'), dependency.manifest);
        });
    }

    copyTargetPackageFiles() {
        let targetPackage = this.targetPackage.pkg;

        const filesToCopy = fs.readdirSync(targetPackage.dir);

        filesToCopy.forEach(file => {
                if (file !== this.outDir) {
                    fse.copySync(
                        path.join(targetPackage.dir, file),
                        path.join(this.outDir, file),
                        {
                            preserveTimestamps: true,
                            filter: (src, _) => {
                                return !this.getIgnorePatterns().some(pattern => src.includes(pattern));
                            },
                        },
                    );
                }
            },
        );

        targetPackage = this.replaceWorkspaceDependenciesVersions(
            targetPackage,
            `./${this.workspaceDependenciesFolder}`,
        );

        writeJsonFile(path.join(this.outDir, 'package.json'), targetPackage.manifest);
    }
}

export { PackageBundler };
