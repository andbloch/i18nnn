/**
 * imports
 */
var fs = require('fs'),
    csv = require('csv'),
    xlsx = require('xlsx'),
    vsprintf = require('sprintf').vsprintf;

/** expose module */
var i18nnn = module.exports;

/**
 * Default optipons.
 *
 * @type {Object}
 */
var config = {
    messagesFilePath: process.cwd()+'/locales/messages.xlsx',
    defaultLocale: '', // first column
    supportedLocales: [], // loadef rom sheet,
    csv: { // in case csv is used
        delimiter: ';',
        escape: '"'
    },
    cookieLocaleKey: 'locale'
}

/**
 * Messages object containing various messages
 */
var messages = {};

/**
 * Initialises i18nnn with options
 *
 * @param opt
 */
i18nnn.init = function(opt) {

    // parse options
    if(opt) {
        if(opt.hasOwnProperty('messagesFilePath')) {
            config.messagesFilePath = opt.messagesFilePath;
        }
        if(opt.hasOwnProperty('csv')) {
            if(opt.csv.hasOwnProperty('delimiter')) {
                config.csv.delimiter = opt.csv.delimiter;
            }
            if(opt.csv.hasOwnProperty('escape')) {
                config.csv.escape = opt.csv.escape;
            }
        }
    }

    // load messages from appropriate file
    var fileExtension = config.messagesFilePath.split('.').pop().toLowerCase();
    if(fileExtension == 'csv') {
        loadCsvMessages(config.messagesFilePath, config.csv);
    } else if (fileExtension == 'xlsx') {
        loadXlsxMessages(config.messagesFilePath);
    } else {
        throw 'File extension '+fileExtension+' not supported!';
    }
    console.log('added i18nnn locale api.')

    // print results
    console.log('supported locales: ' + config.supportedLocales);
    console.log('messages:');
    console.log(messages);
}

/**
 * i18nnn locale middleware taking care of determining the client's locale from his request or
 * cookies (key specified in options).
 *
 * @param req
 * @param res
 * @param next
 */
i18nnn.locale = function(req, res, next) {

    determineLocale(req);

    if (typeof next === "function") {
        next();
    }
}

/**
 * Getter for cookie locale key
 *
 * @return {String}
 */
i18nnn.getCookieLocaleKey = function i18nnnGetCookieLocaleKey() {
    return config.cookieLocaleKey;
}

/**
 * Loads the messages from a CSV file
 *
 * @param filePath
 * @param csvOptions
 */
function loadCsvMessages(filePath, csvOptions) {
    try {
        csv()
            .from.path(filePath, csvOptions)
            .to.array(function(data) {

                // load locales into supportedLocales
                var locales = data[0]; // KEY, en, de, fr, it
                locales.splice(0,1); // remove KEY
                config.supportedLocales = locales;

                // remove locales line
                data.splice(0,1);

                // fill messages object
                for(var i=0; i<data.length; i++) {
                    var row = data[i];
                    for(var j=0; j<locales.length; j++) {
                        messages[row[0]+"."+locales[j]] = row[j+1];
                    }
                }
            });
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

/**
 * Loads the messages from an XLSX file
 *
 * @param filePath
 */
function loadXlsxMessages(filePath) {

    var workbook = xlsx.readFile(filePath);
    var sheetName = workbook.SheetNames[0];
    var sheet = workbook.Sheets[sheetName];

    // determine number of columns
    var numCols = 0;
    for(var address in sheet) {
        if(address[0] === '!') continue; // (value of cell is !ref)
        if(address[1] === '2') break; // we got on a new row
        else numCols++;
    }

    // determine supported locales
    var locales = [];
    var lc = 0; // locales counter
    for(var address in sheet) {
        if(lc === 0 || address[0] === '!') { // skip first value: "KEY" or if value of cell is !ref
            lc++;
            continue;
        } else if (lc == numCols) {
            break;
        } else {
            locales.push(sheet[address].v);
            lc++;
        }
    }
    config.supportedLocales = locales;

    // fill messages object
    var mc = 0; // messages counter
    var messageKey = ''; // current message key
    for(var address in sheet) {
        if(mc < numCols || address[0] === '!') { // skip first row or if value of cell is !ref
            mc++;
            continue;
        }

        var columnIndex = mc % numCols;
        if(columnIndex==0) { // it's a key
            messageKey = sheet[address].v;
        } else { // it's a value
            var currentLocale = locales[columnIndex-1];
            messages[messageKey +'.'+currentLocale] = sheet[address].v;
        }
        mc++;
    }
}

/**
 * Gets a message for a key and locale and renders it with the supplied args
 *
 * @param key
 * @param args
 * @param locale
 * @return {String}
 */
i18nnn.__ = function i18nnnGetMessage(key, args, locale) {
    var message = "";
    if(arguments.length == 1) {
        message = getMessage(key);
    } else if(arguments.length == 2) {
        locale = arguments[1];
        console.log("locale: "+ locale);
        message = getMessage(key, locale);
    } else if(arguments.length == 3) {
        message = getMessage(key, locale);
        message = renderMessage(message, args);
    } else {
        throw 'i18nnn __(...) only supports 1 to 3 args!';
    }
    return message;
}

/**
 * Gets a message by key and locales
 *
 * @param key
 * @param locale
 * @return {*}
 */
function getMessage(key, locale) {

    // determine if locale is specified and supported
    if(typeof locale === "string" && config.supportedLocales.indexOf(locale) != -1) {
        key += "."+locale;
    } else {
        key += "."+config.defaultLocale;
    }

    // get message if possible
    if(messages.hasOwnProperty(key)) {
        return messages[key];
    } else {
        throw "message for key '"+key+"' doesn't exist!";
    }
}

/**
 * Renders a message with the supplied args.
 *
 * @param message
 * @param args
 */
function renderMessage(message, args) {
    message = vsprintf(message, args);
    return message;
}

/**
 * guess language setting based on http headers
 *
 * https://github.com/mashpie/i18n-node/blob/master/i18n.js
 */
function determineLocale(req) {

    if (typeof req === 'object') {
        var language_header = req.headers['accept-language'],
            languages = [],
            regions = [];

        req.languages = [config.defaultLocale];
        req.regions = [config.defaultLocale];
        req.language = config.defaultLocale;
        req.region = config.defaultLocale;

        if (language_header) {
            language_header.split(',').forEach(function (l) {
                var header = l.split(';', 1)[0],
                    lr = header.split('-', 2);
                if (lr[0]) {
                    languages.push(lr[0].toLowerCase());
                }
                if (lr[1]) {
                    regions.push(lr[1].toLowerCase());
                }
            });

            if (languages.length > 0) {
                req.languages = languages;
                req.language = languages[0];
            }

            if (regions.length > 0) {
                req.regions = regions;
                req.region = regions[0];
            }
        }

        // setting the language by cookie
        if (config.cookieLocaleKey && req.cookies && req.cookies[config.cookieLocaleKey]) {
            console.log('cookie exists!');
            req.language = req.cookies[config.cookieLocaleKey];
        }

        // switch back to default langauge if language is not supported
        if(config.supportedLocales.indexOf(req.language) == -1) {
            req.language = config.defaultLocale;
        }
    }
}
