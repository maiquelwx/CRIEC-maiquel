export const CONFIG = {
  clima: {
    label: "Clima",
    camadasIniciais: ["bacias"],
    labelSugeridas: "Sugeridas para clima",
    ordemVariaveisSetor: [
      "V00201", "V00309", "V00312", "V00401",
      "V01006", "V0007", "V01041", "V01040", "V01031", "V06004",
    ],
  },
  vulnerabilidade: {
    label: "Vulnerabilidade",
    camadasIniciais: ["municipios", "cadunico"],
    labelSugeridas: "Sugeridas para vulnerabilidade",
    ordemVariaveisSetor: [
      "V06004", "V01041", "V01040", "V01031",
      "V0007", "V01006", "V00201", "V00309", "V00312", "V00401",
    ],
  },
  risco: {
    label: "Risco de Desastres",
    camadasIniciais: ["municipios", "area_afetada_2024"],
    labelSugeridas: "Sugeridas para risco de desastres",
    ordemVariaveisSetor: [
      "V00401", "V00201", "V00309", "V00312",
      "V01041", "V01040", "V01031", "V0007", "V01006", "V06004",
    ],
  },
  setores: {
    label: "Setores Censitários",
    camadasIniciais: ["setores_censitarios_banco"],
    labelSugeridas: "Sugeridas para setores censitários",
    ordemVariaveisSetor: [
      "V01006", "V0007", "V01041", "V01040", "V01031",
      "V00201", "V00309", "V00312", "V00401", "V06004",
    ],
  },
} as const

export type ViewKey = keyof typeof CONFIG