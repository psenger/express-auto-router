## Deployment Steps

These are notes for deploying to NPM. I used `npmrc` to manage my NPM identities
(`npm i npmrc -g` to install ). Then I created a new profile called `public` with
(`npmrc -c public`) and then switch to it with `npmrc public`.

* merge all features and bugs to `dev`
* delete feature and bug branches
  * once you are satisfied that all tests work in `dev`
  * create and merge pull request to `main` from `dev`
* check out `main`
* `npm run build`
* `npm run test:coverage`
* `npm run test:lint`
* `npm run build:readme`
* `npm run build:github-docs`
* because the docs are always out of sync, maybe you should push at this step.
* Use [Cutting Releases](#cutting-releases) to create the tag and release version
* push the all doc changes, `tag`,`package.json`,`package-lock.json` as well as the `CHANGELOG.md` to the `main` branch
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

