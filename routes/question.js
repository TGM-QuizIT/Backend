var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Frage hinzufügen */
router.post('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        questionText: 'string',
        options: [
            {
                optionText: 'string',
                optionCorrect: 'boolean',
            },
        ],
        focusId: 'number',
        mChoice: 'boolean',
        textInput: 'optional boolean',
        imageAddress: 'optional string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertQuestion(?,?,?,?,?)", [data.questionText, data.focusId, data.mChoice, data.textInput, data.imageAddress], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                const questionId = result[0][0].id;
                const options = data.options;
                options.forEach((option) => {
                    executeQuery("CALL InsertOption(?,?,?)", [option.optionText, option.optionCorrect, questionId], res,
                        (otherResult) => {
                            if (otherResult[0][0].result == "404") {
                                res.status(404).json(createErrorResponse("Question not found"));
                            }
                        },
                        (error) => {
                            console.error(error)
                            res.status(500).json(createErrorResponse('Internal Server Error'));
                        }
                    );
                });
                executeQuery("CALL GetSingleQuestion(?)", [questionId], res,
                    (otherResult) => {
                        const questionData = otherResult[0];
                        const options = questionData.map(option => ({
                            optionId: option.optionId,
                            optionText: option.optionText,
                            optionCorrect: option.optionCorrect === 1
                        }));
                        const question = {
                            questionId: questionId,
                            questionText: questionData[0].questionText,
                            options: options,
                            focusId: questionData[0].focusId,
                            mChoice: questionData[0].mChoice === 1,
                            textInput: questionData[0].textInput === 1,
                            imageAddress: questionData[0].imageAddress
                        };
                        res.status(200).json(createSuccessResponse({question: question}));
                    },
                    (error) => {
                        console.error(error)
                        res.status(500).json(createErrorResponse('Internal Server Error'));
                    }
                );
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );

});

/* Frage löschen */
router.delete('/', function (req, res) {
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

    executeQuery("CALL DeleteQuestion(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Question not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Frage bearbeiten */
router.put('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        questionId: 'number',
        questionText: 'string',
        options: [
            {
                optionId: 'number',
                optionText: 'string',
                optionCorrect: 'boolean',
            },
        ],
        focusId: 'number',
        mChoice: 'boolean',
        textInput: 'optional boolean',
        imageAddress: 'optional string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }
    executeQuery("CALL UpdateQuestion(?,?,?,?,?,?)", [data.questionId, data.questionText, data.focusId, data.mChoice, data.textInput, data.imageAddress], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                const questionId = data.questionId;
                const options = data.options;
                options.forEach((option) => {
                    executeQuery("CALL UpdateOption(?,?,?,?)", [option.optionId, option.optionText, option.optionCorrect, questionId], res,
                        (otherResult) => {
                            if (otherResult[0][0].result == "404") {
                                res.status(404).json(createErrorResponse("Option not found"));
                            }
                        },
                        (error) => {
                            console.error(error)
                            res.status(500).json(createErrorResponse('Internal Server Error'));
                        }
                    );
                });
                executeQuery("CALL GetSingleQuestion(?)", [questionId], res,
                    (otherResult) => {
                        const questionData = otherResult[0];
                        const options = questionData.map(option => ({
                            optionId: option.optionId,
                            optionText: option.optionText,
                            optionCorrect: option.optionCorrect === 1
                        }));
                        const question = {
                            questionId: questionId,
                            questionText: questionData[0].questionText,
                            options: options,
                            focusId: questionData[0].focusId,
                            mChoice: questionData[0].mChoice === 1,
                            textInput: questionData[0].textInput === 1,
                            imageAddress: questionData[0].imageAddress
                        };
                        res.status(200).json(createSuccessResponse({question: question}));
                    },
                    (error) => {
                        console.error(error)
                        res.status(500).json(createErrorResponse('Internal Server Error'));
                    }
                );
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Fragen zu Schwerpunkt holen */
router.get('/focus', function (req, res) {
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

    executeQuery("CALL GetFocusQuestions(?)", [data.id], res,
        (result) => {
            const responseData = result[0]
            let questionsMap = {};
            responseData.forEach(item => {
                if (!questionsMap[item.questionId]) {
                    questionsMap[item.questionId] = {
                        questionId: item.questionId,
                        questionText: item.questionText,
                        options: [],
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
            res.status(200).json(createSuccessResponse({focusId: data.id, questions: Object.values(questionsMap)}));
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Fragen zu Fach (und Jahrgang holen */
router.get('/subject', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        id: 'number',
        year: 'optional number',
    };

    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetSubjectQuestions(?,?)", [data.id, data.year], res,
        (result) => {
            const responseData = result[0]
            let questionsMap = {};
            responseData.forEach(item => {
                if (!questionsMap[item.questionId]) {
                    questionsMap[item.questionId] = {
                        questionId: item.questionId,
                        questionText: item.questionText,
                        options: [],
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
            res.status(200).json(createSuccessResponse({subjectId: data.id, questions: Object.values(questionsMap)}));
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;