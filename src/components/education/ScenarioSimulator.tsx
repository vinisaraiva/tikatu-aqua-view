
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcwIcon, DropletIcon } from "lucide-react";
import { 
  calculateIQA, 
  calculateIET, 
  getIQAStatus, 
  getIETStatus,
  WaterParameters 
} from "@/utils/waterQualityCalculations";

const ScenarioSimulator = () => {
  const [parameters, setParameters] = useState<WaterParameters>({
    ph: 7.2,
    turbidity: 10,
    oxygen: 6.5,
    nutrients: 15,
    temperature: 22
  });

  const handleParameterChange = (param: keyof WaterParameters, value: number[]) => {
    setParameters(prev => ({
      ...prev,
      [param]: value[0]
    }));
  };

  const resetParameters = () => {
    setParameters({
      ph: 7.2,
      turbidity: 10,
      oxygen: 6.5,
      nutrients: 15,
      temperature: 22
    });
  };

  const iqa = calculateIQA(parameters);
  const iet = calculateIET(parameters.nutrients);
  const iqaStatus = getIQAStatus(iqa);
  const ietStatus = getIETStatus(iet);

  const getDynamicMessage = () => {
    const messages = [];
    
    if (parameters.ph < 6.5 || parameters.ph > 8.5) {
      messages.push("pH fora da faixa ideal pode afetar a vida aquática");
    }
    
    if (parameters.turbidity > 25) {
      messages.push("Alta turbidez reduz a penetração de luz e afeta a fotossíntese");
    }
    
    if (parameters.oxygen < 5) {
      messages.push("Baixo oxigênio pode causar mortandade de peixes");
    }
    
    if (parameters.nutrients > 30) {
      messages.push("Excesso de nutrientes pode causar eutrofização");
    }
    
    if (parameters.temperature > 30) {
      messages.push("Alta temperatura reduz a capacidade de oxigênio dissolvido");
    }

    return messages.length > 0 ? messages.join(". ") : "Todos os parâmetros estão em níveis adequados!";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DropletIcon className="h-5 w-5 text-teal-600" />
          Simulador de Cenários - Qualidade da Água
        </CardTitle>
        <p className="text-gray-600">
          Ajuste os parâmetros e veja como eles afetam a qualidade da água em tempo real
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles dos Parâmetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              pH: {parameters.ph.toFixed(1)}
            </label>
            <Slider
              value={[parameters.ph]}
              onValueChange={(value) => handleParameterChange('ph', value)}
              min={4}
              max={10}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Ácido (4.0)</span>
              <span>Neutro (7.0)</span>
              <span>Alcalino (10.0)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Turbidez: {parameters.turbidity.toFixed(1)} NTU
            </label>
            <Slider
              value={[parameters.turbidity]}
              onValueChange={(value) => handleParameterChange('turbidity', value)}
              min={0}
              max={100}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Cristalina (0)</span>
              <span>Moderada (50)</span>
              <span>Muito turva (100)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Oxigênio Dissolvido: {parameters.oxygen.toFixed(1)} mg/L
            </label>
            <Slider
              value={[parameters.oxygen]}
              onValueChange={(value) => handleParameterChange('oxygen', value)}
              min={0}
              max={12}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Anóxico (0)</span>
              <span>Adequado (6-8)</span>
              <span>Saturado (12)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nutrientes: {parameters.nutrients.toFixed(1)} mg/L
            </label>
            <Slider
              value={[parameters.nutrients]}
              onValueChange={(value) => handleParameterChange('nutrients', value)}
              min={0}
              max={60}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Baixo (0)</span>
              <span>Moderado (30)</span>
              <span>Alto (60)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Temperatura: {parameters.temperature.toFixed(1)} °C
            </label>
            <Slider
              value={[parameters.temperature]}
              onValueChange={(value) => handleParameterChange('temperature', value)}
              min={5}
              max={40}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Frio (5°C)</span>
              <span>Ideal (20-25°C)</span>
              <span>Quente (40°C)</span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-700">IQA</h3>
                <div className="text-3xl font-bold text-teal-600">{iqa}</div>
                <Badge className={iqaStatus.color}>
                  {iqaStatus.status}
                </Badge>
                <p className="text-sm text-gray-600">{iqaStatus.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-700">IET</h3>
                <div className="text-3xl font-bold text-blue-600">{iet}</div>
                <Badge className={ietStatus.color}>
                  {ietStatus.status}
                </Badge>
                <p className="text-sm text-gray-600">{ietStatus.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem Dinâmica */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Análise Dinâmica</h3>
            <p className="text-gray-600">{getDynamicMessage()}</p>
          </CardContent>
        </Card>

        {/* Botão Reset */}
        <div className="flex justify-center">
          <Button onClick={resetParameters} variant="outline">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Resetar Parâmetros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioSimulator;
