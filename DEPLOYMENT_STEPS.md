## Deployment Steps

These are notes for deploying to NPM. I used `npmrc` to manage my NPM identities
(`npm i npmrc -g` to install ). Then I created a new profile called `public` with
(`npmrc -c public`) and then switch to it with `npmrc public`.


* check out `main`
* `npm run build`
* `npm run test:coverage`
* `npm run test:lint`
* `npm run build:readme`
* Use [Cutting Releases](#cutting-releases) to create the tag and release version
* push the changes and `tag`,`package.json`,`package-lock.json` and the `CHANGELOG.md` to the `main` branch
* `npm publish --access public`
* Then merge the `main` into `dev` and push
* Then merge the `main` into `publish` and push

### Cutting Releases

Rather than `npm version`, use:

* `npm run release -- --release-as major`
* `npm run release -- --release-as minor`
* `npm run release -- --release-as patch`

this will change the `package.json` , `package-lock.json` and the `CHANGELOG.md`

### First Release

```shell
npm run release -- --first-release
```

