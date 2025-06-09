
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon, XCircleIcon, AwardIcon, RotateCcwIcon } from "lucide-react";
import { quizQuestions } from "@/data/quizQuestions";

const EnvironmentalQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, selectedAnswer]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowFeedback(false);
    setQuizCompleted(false);
    setUserAnswers([]);
  };

  const getScoreBadge = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 90) return { text: "Especialista em Água!", color: "bg-green-500" };
    if (percentage >= 70) return { text: "Guardião Ambiental", color: "bg-blue-500" };
    if (percentage >= 50) return { text: "Aprendiz Ecológico", color: "bg-yellow-500" };
    return { text: "Explorador Iniciante", color: "bg-orange-500" };
  };

  const progress = ((currentQuestion + (showFeedback ? 1 : 0)) / quizQuestions.length) * 100;

  if (quizCompleted) {
    const badge = getScoreBadge();
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AwardIcon className="h-6 w-6 text-yellow-500" />
            Quiz Concluído!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl font-bold text-teal-600">{score}/{quizQuestions.length}</div>
            <Badge className={`text-white ${badge.color} text-lg px-4 py-2`}>
              {badge.text}
            </Badge>
            <p className="text-gray-600">
              Você acertou {score} de {quizQuestions.length} perguntas!
            </p>
          </div>

          {/* SVG Badge */}
          <div className="flex justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="text-teal-600">
              <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M45 60l10 10 20-20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Feedback Final</h3>
            <p className="text-gray-600">
              {score >= 9 && "Excelente! Você domina os conceitos de qualidade da água."}
              {score >= 7 && score < 9 && "Muito bom! Você tem um conhecimento sólido sobre o tema."}
              {score >= 5 && score < 7 && "Bom trabalho! Continue estudando para aprimorar seus conhecimentos."}
              {score < 5 && "Continue aprendendo! Revise os conceitos e tente novamente."}
            </p>
          </div>

          <Button onClick={resetQuiz} className="mt-6">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Refazer Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz Ambiental</CardTitle>
          <Badge variant="outline">
            {currentQuestion + 1}/{quizQuestions.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>Pontuação: {score}/{currentQuestion + (showFeedback ? 1 : 0)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 border rounded-lg transition-colors ";
              
              if (showFeedback) {
                if (index === question.correctIndex) {
                  buttonClass += "bg-green-50 border-green-500 text-green-700";
                } else if (index === selectedAnswer && index !== question.correctIndex) {
                  buttonClass += "bg-red-50 border-red-500 text-red-700";
                } else {
                  buttonClass += "bg-gray-50 border-gray-300 text-gray-600";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += "bg-teal-50 border-teal-500 text-teal-700";
                } else {
                  buttonClass += "hover:bg-gray-50 border-gray-300";
                }
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                >
                  <div className="flex items-center gap-3">
                    {showFeedback && (
                      <>
                        {index === question.correctIndex && (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        )}
                        {index === selectedAnswer && index !== question.correctIndex && (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </>
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Explicação</h4>
              <p className="text-blue-800">{question.explanation}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            Pergunta {currentQuestion + 1} de {quizQuestions.length}
          </div>
          {!showFeedback ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              Confirmar Resposta
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestion < quizQuestions.length - 1 ? "Próxima Pergunta" : "Finalizar Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentalQuiz;
