var AdmZip = require('adm-zip'),
    wrench = require('wrench'),
    outputDir = __dirname + '/../versions/',
    inputDir = __dirname + '/../build/',
    packageJson = require(__dirname + '/../package.json'),
    version = packageJson.version,
    packageName = packageJson.name;


function zipDir(name) {
    var zip = new AdmZip(),
        folderName = packageName + '-' + name;

    wrench.copyDirSyncRecursive(inputDir, folderName, {
        forceDelete: true
    });
    zip.addLocalFolder(folderName);
    zip.writeZip(outputDir + folderName +'.zip');
    wrench.rmdirSyncRecursive(folderName, true);
}

module.exports = function() {
    zipDir(version);
};

