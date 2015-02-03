(function () {

    'use strict';

    var fs = require('fs');
    var path = require('path');
    var _ = require('underscore');
    var s = require('underscore.string');

    var projectPathCtx = '../../../';
    var bundlesPathCtx = 'test';

    var depsFileName = 'blocks.auto.used.less';
    var necessaryDepsFileName = 'blocks.auto.used.new.less';

    var baseBundleName = 'a-bundle';
    var localBundleName = 'f-bundle';

    var bundlePath = function (bundleName) {
        return path.join(bundlesPathCtx, bundleName);
    };
    var bundleDepsPath = function (bundleName) {
        return path.join(bundlePath(bundleName), depsFileName);
    };
    var readBundleDeps = function (bundleName) {
        var fileContent = fs.existsSync(bundleDepsPath(bundleName)) ?
            fs.readFileSync(bundleDepsPath(bundleName)) : undefined;
        var deps = [];
        if (fileContent) {
            deps = fileContent.toString().split('\n');
            deps = _.compact(deps);
        }
        return deps;
    };
    var getBundleLocalPath = function (bundleName) {
        return path.join(projectPathCtx, bundlePath(bundleName));
    };
    var replaceLocalPaths = function (deps, bundleName) {
        var importExpressionStartPattern = '@import "';
        var localImportPattern = '@import "b-';
        var currentDirectoryPath = getBundleLocalPath(bundleName).split(path.sep).join('/') + '/';

        deps = _.map(deps, function (i) {
            if (s(i).startsWith(localImportPattern)) {
                i = i.replace(importExpressionStartPattern, importExpressionStartPattern + currentDirectoryPath);
            }
            return i;
        });

        return deps;
    };
    var diffBundleBaseDeps = function (baseBundleName, localBundleName) {
        var baseBundleDeps = replaceLocalPaths(readBundleDeps(baseBundleName), baseBundleName);
        var localBundleDeps = replaceLocalPaths(readBundleDeps(localBundleName), localBundleName);
        return _.difference(localBundleDeps, baseBundleDeps);
    };
    var writeNecessaryDepsToFile = function (content, bundleName) {
        var necessaryDepsFilePath = path.join(bundlePath(bundleName), necessaryDepsFileName);

        fs.writeFileSync(necessaryDepsFilePath, content.join('\n'));
    };

    writeNecessaryDepsToFile(diffBundleBaseDeps(baseBundleName, localBundleName), localBundleName);

}());
