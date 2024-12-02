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

const otherRouter = require('./routes/other');
app.use('/', otherRouter);

// 404 Error handler
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

BigInt.prototype.toJSON = function () {
    return this.toString(); // Convert BigInt to string
};

// Export the app module without starting it
module.exports = app;
