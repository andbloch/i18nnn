*This library is still in its early stages. Feel free to contribute! Have a look at the todos.txt.*


## Installation

    npm install i18nnn


## Locales Management

The messages can easily be managed in an <code>.xlsx</code> or <code>.csv</code> spreadsheet as
shown below. The messages are managed in keys and the supported languages are defined in columns.
The first language column acts as default language.

![xlsx localisation](https://raw.github.com/ndrizza/i18nnn/master/i18n.png)

The messages for the appropriate language can then be used as follows:

    app.get('/', function(req, res) {
    
        var model = {
            // get message in default language
            other: i18nnn.__("messages.hello"),
    
            // get localized message
            title: i18nnn.__("messages.title", req.locale),
    
            // get localized and parametrized message
            message: i18nnn.__("messages.hello.name.surname", ['John', 'Doe'], req.locale)
        };
    
        res.render('index', model)
    });


## Setup and Configuration

i18nnn can be configured in your <code>app.js</code> or <code>server.js</code> file as follows:

    var i18nnn = require('i18nnn');

Additionally, i18nnn needs to be initialised with the messages. Thereby the default options can be
used, or custom options can be specified.

    i18nnn.init(); // intilialise with default options

Here's an example of custom configuration, equivalent to the initialisation with the default
options shown before:

    var options = {
        
        messagesFilePath: process.cwd()+'/locales/messages.xlsx',
        
        csv: { // if you're using csv intead of xlsx
            delimiter: ';',
            escape: '"'
        },
        
        // default cookie key for locale
        // the locale middleware (express) will use this field to store the determined the locale
        cookieLocaleKey: 'locale'
    };

    // initialise with custom uptions
    i18nnn.init(options);


## Locale Middleware for Express

i18nnn also comes with a locale middleware which can be used in expressJS to attach the locale to ExpressJS' <code>req</code> object. Anyways, you are left free to use this locale middleware or another one.

    // ensure you enable expressJS' cookie parser before enabling the locale middleware
    app.use(express.cookieParser());
    app.use(i18nnn.locale); // enables i18nnn locale middleware

This will enrich the <code>req</code> object with the following properties:

    req.languages // [de, de, en, en]
    req.regions // [de, us]
    req.language // de
    req.region // de

Use <code>req.language</code> to render your messages, if the language is not specified in your
spreadsheet it will return the message in the language of the first language column of your spreadsheet.
