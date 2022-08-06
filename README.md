# pnpm-bundle-workspace-package

CLI tool to bundle a single pnpm workspace package

### Motivation

Some services like GCP Functions, AWS Lambda or SCW Functions only allow us to use
npm or yarn as package managers, making difficult to deploy functions that depend
on other packages of our monorepo.

I found that although [pnpm-isolate-workspace](https://github.com/Madvinking/pnpm-isolate-workspace)
is a great tool to isolate a single workspace package, it still creates a pnpm like structure
that we cannot directly use in the above-mentioned services.

### Quick start

```bash
pnpm-bundle-workspace-package [package name or path]
```

### Options

- --outDir [path] 
