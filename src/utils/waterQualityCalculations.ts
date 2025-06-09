
export interface WaterParameters {
  ph: number;
  turbidity: number;
  oxygen: number;
  nutrients: number;
  temperature: number;
  coliforms: number;
  dbo: number;
  phosphorus: number;
  nitrogen: number;
}

export function calculateIQA(params: WaterParameters): number {
  // Cálculo do IQA baseado em 9 parâmetros com pesos específicos
  const phScore = getPhScore(params.ph);
  const turbidityScore = getTurbidityScore(params.turbidity);
  const oxygenScore = getOxygenScore(params.oxygen);
  const temperatureScore = getTemperatureScore(params.temperature);
  const coliformsScore = getColiformsScore(params.coliforms);
  const dboScore = getDboScore(params.dbo);
  const phosphorusScore = getPhosphorusScore(params.phosphorus);
  const nitrogenScore = getNitrogenScore(params.nitrogen);
  
  // Pesos dos parâmetros segundo metodologia CETESB
  const iqa = (
    phScore * 0.11 + 
    turbidityScore * 0.08 + 
    oxygenScore * 0.17 + 
    temperatureScore * 0.10 + 
    coliformsScore * 0.15 + 
    dboScore * 0.10 + 
    phosphorusScore * 0.10 + 
    nitrogenScore * 0.10 + 
    params.nutrients * 0.09
  );
  
  return Math.round(Math.max(0, Math.min(100, iqa)));
}

export function calculateIET(nutrients: number, phosphorus: number, chlorophyll?: number): number {
  // Cálculo do IET baseado em fósforo total e nutrientes
  let ietPhosphorus = 10 * (6.77 + 1.08 * Math.log10(phosphorus));
  let ietNutrients = 10 * (6.77 + 1.08 * Math.log10(nutrients));
  
  // Média dos índices
  let iet = (ietPhosphorus + ietNutrients) / 2;
  
  return Math.round(Math.max(0, Math.min(100, iet)));
}

function getPhScore(ph: number): number {
  if (ph >= 6.5 && ph <= 8.5) return 90;
  if (ph >= 6.0 && ph < 6.5) return 70;
  if (ph > 8.5 && ph <= 9.0) return 70;
  if (ph >= 5.5 && ph < 6.0) return 50;
  if (ph > 9.0 && ph <= 9.5) return 50;
  return 20;
}

function getTurbidityScore(turbidity: number): number {
  if (turbidity <= 5) return 95;
  if (turbidity <= 10) return 85;
  if (turbidity <= 25) return 70;
  if (turbidity <= 50) return 50;
  if (turbidity <= 100) return 30;
  return 10;
}

function getOxygenScore(oxygen: number): number {
  if (oxygen >= 8) return 95;
  if (oxygen >= 6) return 85;
  if (oxygen >= 4) return 60;
  if (oxygen >= 2) return 30;
  return 10;
}

function getTemperatureScore(temperature: number): number {
  if (temperature >= 18 && temperature <= 28) return 90;
  if (temperature >= 15 && temperature < 18) return 75;
  if (temperature > 28 && temperature <= 32) return 75;
  if (temperature >= 10 && temperature < 15) return 60;
  if (temperature > 32 && temperature <= 35) return 60;
  return 30;
}

function getColiformsScore(coliforms: number): number {
  if (coliforms <= 1) return 95;
  if (coliforms <= 10) return 85;
  if (coliforms <= 100) return 70;
  if (coliforms <= 1000) return 50;
  if (coliforms <= 10000) return 30;
  return 10;
}

function getDboScore(dbo: number): number {
  if (dbo <= 1) return 95;
  if (dbo <= 2) return 85;
  if (dbo <= 4) return 70;
  if (dbo <= 8) return 50;
  if (dbo <= 15) return 30;
  return 10;
}

function getPhosphorusScore(phosphorus: number): number {
  if (phosphorus <= 0.02) return 95;
  if (phosphorus <= 0.05) return 85;
  if (phosphorus <= 0.1) return 70;
  if (phosphorus <= 0.2) return 50;
  if (phosphorus <= 0.5) return 30;
  return 10;
}

function getNitrogenScore(nitrogen: number): number {
  if (nitrogen <= 0.5) return 95;
  if (nitrogen <= 1.0) return 85;
  if (nitrogen <= 2.0) return 70;
  if (nitrogen <= 5.0) return 50;
  if (nitrogen <= 10.0) return 30;
  return 10;
}

export function getIQAStatus(iqa: number): { status: string; color: string; description: string } {
  if (iqa >= 91) {
    return {
      status: "Excelente",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Água de qualidade excelente, adequada para todos os usos."
    };
  } else if (iqa >= 71) {
    return {
      status: "Boa",
      color: "text-green-600 bg-green-50 border-green-200",
      description: "Água de boa qualidade, adequada para a maioria dos usos."
    };
  } else if (iqa >= 51) {
    return {
      status: "Regular",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Água de qualidade regular, pode requerer tratamento."
    };
  } else if (iqa >= 26) {
    return {
      status: "Ruim",
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Água de qualidade ruim, imprópria para muitos usos."
    };
  } else {
    return {
      status: "Péssima",
      color: "text-red-600 bg-red-50 border-red-200",
      description: "Água de qualidade péssima, imprópria para a maioria dos usos."
    };
  }
}

export function getIETStatus(iet: number): { status: string; color: string; description: string } {
  if (iet <= 47) {
    return {
      status: "Oligotrófico",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Baixa concentração de nutrientes, águas claras."
    };
  } else if (iet <= 52) {
    return {
      status: "Mesotrófico",
      color: "text-green-600 bg-green-50 border-green-200",
      description: "Concentração moderada de nutrientes."
    };
  } else if (iet <= 59) {
    return {
      status: "Eutrófico",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Alta concentração de nutrientes, possível proliferação de algas."
    };
  } else if (iet <= 63) {
    return {
      status: "Supereutrófico",
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Concentração muito alta de nutrientes."
    };
  } else {
    return {
      status: "Hipereutrófico",
      color: "text-red-600 bg-red-50 border-red-200",
      description: "Concentração extremamente alta de nutrientes, alta proliferação de algas."
    };
  }
}
