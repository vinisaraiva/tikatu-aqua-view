
export interface WaterParameters {
  ph: number;
  turbidity: number;
  oxygen: number;
  nutrients: number;
  temperature: number;
}

export function calculateIQA(params: WaterParameters): number {
  // Simplified IQA calculation based on key parameters
  // Real IQA uses 9 parameters with specific weight factors
  
  const phScore = getPhScore(params.ph);
  const turbidityScore = getTurbidityScore(params.turbidity);
  const oxygenScore = getOxygenScore(params.oxygen);
  const temperatureScore = getTemperatureScore(params.temperature);
  
  // Weighted average (simplified)
  const iqa = (phScore * 0.25 + turbidityScore * 0.25 + oxygenScore * 0.35 + temperatureScore * 0.15);
  
  return Math.round(Math.max(0, Math.min(100, iqa)));
}

export function calculateIET(nutrients: number, chlorophyll?: number): number {
  // Simplified IET calculation based on nutrients
  // Real IET uses phosphorus, chlorophyll-a, and Secchi disk transparency
  
  let iet = 0;
  
  if (nutrients <= 10) {
    iet = 30; // Oligotrófico
  } else if (nutrients <= 20) {
    iet = 45; // Mesotrófico
  } else if (nutrients <= 35) {
    iet = 55; // Eutrófico
  } else if (nutrients <= 50) {
    iet = 65; // Supereutrófico
  } else {
    iet = 75; // Hipereutrófico
  }
  
  return Math.round(iet);
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
