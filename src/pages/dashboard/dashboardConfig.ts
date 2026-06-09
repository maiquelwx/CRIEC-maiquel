export const CONFIG = {
  clima: {
    label: "Clima",
    camadasIniciais: ["bacias"],
  },
  vulnerabilidade: {
    label: "Vulnerabilidade",
    camadasIniciais: ["municipios", "cadunico"],
  },
  risco: {
    label: "Risco de Desastres",
    camadasIniciais: ["municipios", "area_afetada_2024"],
  },
} as const

export type ViewKey = keyof typeof CONFIG
