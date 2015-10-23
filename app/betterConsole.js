// betterConsole.loadingLog("55% loaded");
// betterConsole.loadingLog("56% loaded");
var loader_index = 0;
var loaderIcons =  ['|', '/', '-', '\\'];
exports.loadingLog = function(text) {
    process.stdout.write(loaderIcons[loader_index] + ' ' + text + '\r');
    loader_index++;
    loader_index %= loaderIcons.length;
};