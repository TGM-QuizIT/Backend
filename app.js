const express = require('express');
const app = express();
var path = require('path');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Initialisieren aller Routen innerhalb des Backends
var userRouter = require('./routes/user');
app.use('/user', userRouter);

var subjectRouter = require('./routes/subject');
app.use('/subject', subjectRouter);

var focusRouter = require('./routes/focus');
app.use('/focus', focusRouter);

var questionRouter = require('./routes/question');
app.use('/question', questionRouter);

var quizRouter = require('./routes/quiz');
app.use('/quiz', quizRouter);

var resultRouter = require('./routes/result');
app.use('/result', resultRouter);

var friendsRouter = require('./routes/friends');
app.use('/friends', friendsRouter);

var otherRouter = require('./routes/other');
app.use('/', otherRouter);

app.use((req,res,next)=>{
    res.status(404).send('Not Found');
});

const port = process.env.APP_PORT;
app.listen(port, () => {
    console.log('Server running on ' + port);
});
