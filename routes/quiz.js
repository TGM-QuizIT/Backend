var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey, formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Quiz für Schwerpunkt generieren */
router.get('/focus', function(req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GenerateFocusQuiz(?)", [data.id], res,
        (result) => {
            const responseData = result[0]
            let questionsMap = {};
            responseData.forEach(item => {
                if (!questionsMap[item.questionId]) {
                    questionsMap[item.questionId] = {
                        questionId: item.questionId,
                        questionText: item.questionText,
                        options: [],
                        focusId: item.focusId,
                        mChoice: item.mChoice === 1,
                        textInput: item.textInput === 1,
                        imageAddress: item.imageAddress || null
                    };
                }
                questionsMap[item.questionId].options.push({
                    optionId: item.optionId,
                    optionText: item.optionText,
                    optionCorrect: item.optionCorrect === 1
                });
            });
            const questions = Object.values(questionsMap);
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
            res.status(200).json(createSuccessResponse({focusId: data.id, questions: questions}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Quiz für Fach (und Jahr) generieren */
router.get('/subject', function(req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        id: 'number',
        year: 'optional number'
    };

    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GenerateSubjectQuiz(?,?)", [data.id, data.year], res,
        (result) => {
            const responseData = result[0]
            let questionsMap = {};
            responseData.forEach(item => {
                if (!questionsMap[item.questionId]) {
                    questionsMap[item.questionId] = {
                        questionId: item.questionId,
                        questionText: item.questionText,
                        options: [],
                        focusId: item.focusId,
                        mChoice: item.mChoice === 1,
                        textInput: item.textInput === 1,
                        imageAddress: item.imageAddress || null
                    };
                }
                questionsMap[item.questionId].options.push({
                    optionId: item.optionId,
                    optionText: item.optionText,
                    optionCorrect: item.optionCorrect === 1
                });
            });
            const questions = Object.values(questionsMap);
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
            res.status(200).json(createSuccessResponse({subjectId: data.id, questions: questions}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});
module.exports = router;
