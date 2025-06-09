
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { WavesIcon, RotateCcwIcon, TreesIcon, AlertTriangleIcon, SparklesIcon } from "lucide-react";
import riverChallengeData from "@/data/riverChallenge.json";

interface RiverState {
  pollution: number;
  biodiversity: number;
  economy: number;
}

const RiverChallenge = () => {
  const [currentRound, setCurrentRound] = useState(0);
  const [riverState, setRiverState] = useState<RiverState>({
    pollution: 10,
    biodiversity: 80,
    economy: 50
  });
  const [totalScore, setTotalScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [lastFeedback, setLastFeedback] = useState("");

  const handleChoiceSelect = (choiceIndex: number) => {
    if (showFeedback) return;
    setSelectedChoice(choiceIndex);
  };

  const handleSubmitChoice = () => {
    if (selectedChoice === null) return;

    const choice = riverChallengeData.rounds[currentRound].choices[selectedChoice];
    
    // Apply effects
    setRiverState(prev => ({
      pollution: Math.max(0, Math.min(100, prev.pollution + choice.effects.pollution)),
      biodiversity: Math.max(0, Math.min(100, prev.biodiversity + choice.effects.biodiversity)),
      economy: Math.max(0, Math.min(100, prev.economy + choice.effects.economy))
    }));

    setTotalScore(prev => prev + choice.score);
    setLastFeedback(choice.feedback);
    setShowFeedback(true);
  };

  const handleNextRound = () => {
    if (currentRound < riverChallengeData.rounds.length - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      setChallengeCompleted(true);
    }
  };

  const resetChallenge = () => {
    setCurrentRound(0);
    setRiverState({ pollution: 10, biodiversity: 80, economy: 50 });
    setTotalScore(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setChallengeCompleted(false);
    setLastFeedback("");
  };

  const getFinalMessage = () => {
    if (totalScore >= 70) return riverChallengeData.finalMessages.excellent;
    if (totalScore >= 40) return riverChallengeData.finalMessages.good;
    if (totalScore >= 10) return riverChallengeData.finalMessages.poor;
    return riverChallengeData.finalMessages.critical;
  };

  const getRiverHealthIcon = () => {
    const avgHealth = (100 - riverState.pollution + riverState.biodiversity) / 2;
    if (avgHealth >= 80) return <SparklesIcon className="h-8 w-8 text-blue-500" />;
    if (avgHealth >= 60) return <WavesIcon className="h-8 w-8 text-teal-500" />;
    if (avgHealth >= 40) return <TreesIcon className="h-8 w-8 text-yellow-500" />;
    return <AlertTriangleIcon className="h-8 w-8 text-red-500" />;
  };

  if (challengeCompleted) {
    const finalMessage = getFinalMessage();
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getRiverHealthIcon()}
            {finalMessage.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="text-4xl font-bold text-teal-600">
              Pontuação: {totalScore}
            </div>
            <p className="text-gray-600 text-lg">
              {finalMessage.message}
            </p>
          </motion.div>

          {/* Estado Final do Rio */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-600">{riverState.pollution}%</div>
                <div className="text-sm text-gray-600">Poluição</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600">{riverState.biodiversity}%</div>
                <div className="text-sm text-gray-600">Biodiversidade</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{riverState.economy}%</div>
                <div className="text-sm text-gray-600">Economia</div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={resetChallenge} className="mt-6">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Refazer Desafio
          </Button>
        </CardContent>
      </Card>
    );
  }

  const round = riverChallengeData.rounds[currentRound];
  const progress = ((currentRound + (showFeedback ? 1 : 0)) / riverChallengeData.rounds.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WavesIcon className="h-5 w-5 text-teal-600" />
          Desafio Rio Vivo
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Rodada {currentRound + 1} de {riverChallengeData.rounds.length}</span>
            <span>Pontuação: {totalScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado Atual do Rio */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 text-center">
              <div className="text-xl font-bold text-red-600">{riverState.pollution}%</div>
              <div className="text-sm text-red-700">Poluição</div>
              <Progress value={riverState.pollution} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <div className="text-xl font-bold text-green-600">{riverState.biodiversity}%</div>
              <div className="text-sm text-green-700">Biodiversidade</div>
              <Progress value={riverState.biodiversity} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 text-center">
              <div className="text-xl font-bold text-blue-600">{riverState.economy}%</div>
              <div className="text-sm text-blue-700">Economia</div>
              <Progress value={riverState.economy} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Cenário Atual */}
        <div>
          <h3 className="text-xl font-semibold mb-2">{round.title}</h3>
          <p className="text-gray-600 mb-4">{round.description}</p>
          
          <div className="space-y-3">
            {round.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left p-4 h-auto ${
                  selectedChoice === index 
                    ? "bg-teal-50 border-teal-500 text-teal-700" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleChoiceSelect(index)}
                disabled={showFeedback}
              >
                {choice.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && selectedChoice !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Consequências</h4>
                <p className="text-blue-800 mb-3">{lastFeedback}</p>
                
                {selectedChoice !== null && (
                  <div className="text-sm text-blue-700">
                    <strong>Efeitos:</strong>
                    {Object.entries(round.choices[selectedChoice].effects).map(([key, value]) => (
                      <span key={key} className="ml-2">
                        {key === 'pollution' && 'Poluição'}
                        {key === 'biodiversity' && 'Biodiversidade'}
                        {key === 'economy' && 'Economia'}
                        : {value > 0 ? '+' : ''}{value}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Controles */}
        <div className="flex justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            {getRiverHealthIcon()}
            Estado do Rio
          </Badge>
          
          {!showFeedback ? (
            <Button
              onClick={handleSubmitChoice}
              disabled={selectedChoice === null}
            >
              Confirmar Escolha
            </Button>
          ) : (
            <Button onClick={handleNextRound}>
              {currentRound < riverChallengeData.rounds.length - 1 ? "Próxima Rodada" : "Ver Resultado"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiverChallenge;
