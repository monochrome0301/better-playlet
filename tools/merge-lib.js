// Merges the built playlet-lib package into the playlet-app package.
// The app then ships one package and creates MainScene directly, instead of
// mounting the library as a component library on every launch (which is what
// made startup slow).

const fs = require('fs-extra');
const path = require('path');
const { zipFolder } = require('roku-deploy');

const root = path.resolve(__dirname, '..');
const appStaging = path.join(root, 'build/playlet-app');
const libStaging = path.join(root, 'build/playlet-lib');
const appZip = path.join(root, 'dist/playlet-app.zip');

if (!fs.existsSync(path.join(libStaging, 'manifest'))) {
    console.error(`Missing ${libStaging}. Build playlet-lib before playlet-app.`);
    process.exit(1);
}

// The library no longer ships as a zip inside the app
fs.removeSync(path.join(appStaging, 'lib'));

fs.copySync(libStaging, appStaging, {
    overwrite: true,
    filter: (src) => {
        const name = path.basename(src);
        // Keep the app manifest; the library's is only needed when it is a component library
        return name !== 'manifest' && name !== 'bslib.brs';
    }
});

// Inside the library, files are read through libpkg:; merged into the app they live in pkg:
let rewritten = 0;
for (const file of fs.readdirSync(appStaging, { recursive: true })) {
    if (!/\.(brs|xml)$/i.test(file)) {
        continue;
    }
    const fullPath = path.join(appStaging, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('libpkg:')) {
        fs.writeFileSync(fullPath, content.replaceAll('libpkg:', 'pkg:'));
        rewritten++;
    }
}

const merged = fs.existsSync(path.join(appStaging, 'components/MainScene.xml'));
const manifest = fs.readFileSync(path.join(appStaging, 'manifest'), 'utf8');
if (!merged || !manifest.includes('title=Playlet')) {
    console.error(`Merge failed: ${merged ? 'app manifest was overwritten' : 'components/MainScene.xml is missing'}`);
    process.exit(1);
}

zipFolder(appStaging, appZip).then(() => {
    console.log(`Merged playlet-lib into playlet-app (${rewritten} files rewritten from libpkg: to pkg:)`);
});
