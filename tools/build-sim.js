// Builds dist/playlet-sim.zip: playlet-lib packaged as a normal app, for the BrightScript
// simulator. brs-engine cannot resolve a component library's pkg:/ or libpkg:/ paths, so the
// library is merged into one package and its libpkg: references are rewritten to pkg:.

const fs = require('fs-extra');
const path = require('path');
const { zipFolder } = require('roku-deploy');

const root = path.resolve(__dirname, '..');
const staging = path.join(root, 'build/playlet-sim');
const outFile = path.join(root, 'dist/playlet-sim.zip');

const libBuild = path.join(root, 'build/playlet-lib');
if (!fs.existsSync(path.join(libBuild, 'manifest'))) {
    console.error(`Missing ${libBuild}. Run "npm run build:sim" instead.`);
    process.exit(1);
}

fs.removeSync(staging);
fs.copySync(libBuild, staging);
fs.copySync(path.join(root, 'playlet-app/src/images'), path.join(staging, 'images'), { overwrite: true });
fs.copySync(path.join(root, 'playlet-app/src/manifest'), path.join(staging, 'manifest'), { overwrite: true });
fs.copySync(path.join(__dirname, 'sim-host/source'), path.join(staging, 'source'), { overwrite: true });
fs.copySync(path.join(__dirname, 'sim-host/components'), path.join(staging, 'components'), { overwrite: true });

let rewritten = 0;
for (const file of fs.readdirSync(staging, { recursive: true })) {
    if (!/\.(brs|xml)$/i.test(file)) {
        continue;
    }
    const fullPath = path.join(staging, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('libpkg:')) {
        fs.writeFileSync(fullPath, content.replaceAll('libpkg:', 'pkg:'));
        rewritten++;
    }
}

zipFolder(staging, outFile).then(() => {
    // Keep the lib the app embeds (playlet-app/src/lib) in sync with this build
    fs.copySync(path.join(root, 'dist/playlet-lib.zip'), path.join(root, 'playlet-app/src/lib/playlet-lib.zip'));
    console.log(`Created ${outFile} (${rewritten} files rewritten from libpkg: to pkg:)`);
});
