## Status: Early Development Status

This library is still in its early stages. Feel free to contribute!


## Installation

    npm install i18nnn


## Application

Message management:

The messages can easily be managed in an <code>.xlsx</code> or <code>.csv</code> spreadsheet as
shown below. The messages are managed in keys and the supported languages are set up as columns.
The first language columns acts as default language.

![xlsx localisation](https://raw.github.com/ndrizza/i18nnn/master/i18n.png)

The messages for the appropriate language can then be used as follows:

app.get('/', function(req, res) {

    var model = {
        // get message in default language
        other: i18nnn.__("messages.hello"),

        // get localized message
        title: i18nnn.__("messages.title", req.locale),

        // get localized and parametrized message
        message: i18nnn.__("messages.hello.name.surname", ['Jhon', 'Doe'], req.locale)
    };

    res.render('index', model)
});


## Setup and Configuration

i18nnn can be configured in your <code>app.js</code> or <code>server.js</code> file as follows:

var i18nnn = require('i18nnn');

Further i18nnn needs to be initialised with the messages. Thereby the default options can be
used, or custom options can be specified.

i18nnn.init(); // intilialise with default options

Here's an example whith a custom configuration, equivalent to the initialisation with the default
options above:

i18nnn.init({ // initialise with custom uptions
    messagesFilePath: process.cwd()+'/locales/messages.xlsx',
    csv: { // if you're using csv intead of xlsx
        delimiter: ';',
        escape: '"'
    },
    cookieLocaleKey: 'locale' // default cookie key for locale, the locale middleware will use
    this to determine the locale
});


## Locale Middleware for Express

i18nnn also comes with a locale middleware which can be used in expressJS to attach the locale to
the request (<code>req</code>) object. But you are left free if you want to use this locale
middleware or another one.

// ensure you enable expressJS' cookie parser before if you need him!
app.use(express.cookieParser());
app.use(i18nnn.locale); // enables i18nnn locale middleware

This will enrich the <code>req</code> object with the following properties:

req.languages // [de, de, en, en]
req.regions // [de, us]
req.language // de
req.region // de

Use <code>req.language</code> to render your messages, if the language is not specified in your
spreadsheet it will switch back to the default language.

## Full Example

TODO


## Troubleshooting

### No known issues for the moment.
