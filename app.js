const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const { createErrorResponse } = require("./config/response");
const { formatError } = require("./config/validator")
const bugsnag = require('@bugsnag/js');
const bugsnagPluginExpress = require('@bugsnag/plugin-express');

const bugsnagClient = bugsnag.start({
    apiKey: process.env.BUGSNAG_API_KEY,
    plugins: [bugsnagPluginExpress]
});

const middleware = bugsnagClient.getPlugin('express');

app.use(middleware.requestHandler);

app.use((req, res, next) => {
    const key = req.headers['authorization'];

    if (!key) {
        return res.status(401).json(createErrorResponse("Unauthorized: No API key provided."));
    }

    if (key !== process.env.API_KEY) {
        return res.status(403).json(createErrorResponse("Forbidden: Invalid API key."));
    }

    next();
});

const routes = [
    { path: '/user', router: require('./routes/user') },
    { path: '/subject', router: require('./routes/subject') },
    { path: '/focus', router: require('./routes/focus') },
    { path: '/question', router: require('./routes/question') },
    { path: '/quiz', router: require('./routes/quiz') },
    { path: '/result', router: require('./routes/result') },
    { path: '/friends', router: require('./routes/friends') },
    { path: '/challenge', router: require('./routes/challenge') }
];

routes.forEach(({ path, router }) => app.use(path, router));

app.use(middleware.errorHandler);

app.use((err, req, res) => {
    bugsnag.notify(err);
    res.status(500).json(createErrorResponse('Internal Server Error', formatError(err)));
});

app.use((req, res) => {
    res.status(404).json(createErrorResponse("Not Found: No matching route."));
});

BigInt.prototype.toJSON = function () {
    return Number(this); // Convert BigInt to normal integer
};

module.exports = app;
