#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkCheerioHtmlFile = function(chf, checksfile, fxnWriteResults) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = chf(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    console.log(JSON.stringify(out, null, 4));
}

var clone = function(fn) {
    return fn.bind({});
};

var openFileAndConvertToCheerio = function(htmlFilename,checkFileName) {
    chf = cheerioHtmlFile(htmlFilename);
    checkCheerioHtmlFile(chf,checkFileName);
};

var openUrlAndConvertToCheerio = function(htmlUrl, checkFileName) {
    rest.get(htmlUrl).on('success', function(results) { 
        chf = cheerio.load(results);
        checkCheerioHtmlFile(chf,checkFileName);
    });
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json')
        .option('-f, --file [html_file]', 'Path to index.html')
        .option('-u, --url [url]', 'URL to index.html')
        .parse(process.argv);
    if (program.file)
        var checkJson = openFileAndConvertToCheerio(program.file, program.checks);
    else if (program.url)
        var checkJson = openUrlAndConvertToCheerio(program.url, program.checks);

    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
