const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const {createErrorResponse} = require("./config/response");
// API-Key Validation
app.use((req, res, next) => {
    const key = req.headers['authorization'];

    if(!key) {
        res.status(401).json(createErrorResponse("Unauthorized: No API key provided."));
    }

    if (key !== process.env.API_KEY) {
        res.status(403).json(createErrorResponse("Forbidden: Invalid API key."));
    }

    next();
});

// Initialize all routes within the backend
const userRouter = require('./routes/user');
app.use('/user', userRouter);

const subjectRouter = require('./routes/subject');
app.use('/subject', subjectRouter);

const focusRouter = require('./routes/focus');
app.use('/focus', focusRouter);

const questionRouter = require('./routes/question');
app.use('/question', questionRouter);

const quizRouter = require('./routes/quiz');
app.use('/quiz', quizRouter);

const resultRouter = require('./routes/result');
app.use('/result', resultRouter);

const friendsRouter = require('./routes/friends');
app.use('/friends', friendsRouter);

const challengeRouter = require('./routes/challenge');
app.use('/challenge', challengeRouter);

app.use((req,res) => {
    res.status(404).json(createErrorResponse("Not Found: No matching route."));
});

BigInt.prototype.toJSON = function () {
    return Number(this); // Convert BigInt to "normal" integer
};

// Export the app module without starting it
module.exports = app;
