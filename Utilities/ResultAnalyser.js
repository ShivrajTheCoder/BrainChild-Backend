const { default: axios } = require("axios");
const QuestionModel = require("../Models/Exam/QuestionModel");

const optionMap = ["A", "B", "C", "D"];

const resultAnalyser = async (response) => {
    const pyUrl = process.env.PY_BACKEND;
    console.log(pyUrl);

    try {
        const { responses } = response;
        const questionResults = [];
        const topicMap = new Map();

        for (const res of responses) {
            const question = await QuestionModel.findById(res.question);
            if (question) {
                console.log(`Found question: ${question}`);
                const selectedOption = optionMap[res.option];
                questionResults.push({
                    questionId: question._id,
                    question: question.description,
                    selectedOption,
                    correctOption: question.correct,
                    marks: question.marks,
                    topic: question.topic
                });

                if (!topicMap.has(question.topic)) {
                    topicMap.set(question.topic, {
                        topic_name: question.topic,
                        marked_answer: [],
                        correct_answer: []
                    });
                }

                const topicData = topicMap.get(question.topic);
                topicData.marked_answer.push(selectedOption);
                topicData.correct_answer.push(question.correct);
            } else {
                console.log(`Question with ID ${res.question} not found`);
            }
        }

        const topicResults = Array.from(topicMap.values());

        // Optionally, you can add the questionResults and topicResults to the response object
        response.questionResults = questionResults;
        response.topicResults = topicResults;

        console.log('Question Results:', questionResults);
        console.log('Topic Results:', topicResults);
        
        const result = await axios.post(`${pyUrl}/strength_analysis`, {
            course: "ABC",
            student_response: topicResults,
        });

        console.log(result.data);
        return result?.data;
    } catch (error) {
        console.error("Error analyzing results:", error);
        return { error: "Failed to analyze results" };
    }
};

module.exports = resultAnalyser;