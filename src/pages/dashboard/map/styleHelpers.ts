import { CAMADAS_DISPONIVEIS } from "@/services/dataService"

export function estiloCamada(id: string, opacidade: number, feature?: any): any {
  if ((id === "cadunico" || id === "combinado" || id === "bacias_combinado") && feature?.properties) {
    const taxa = id === "bacias_combinado"
      ? feature.properties.taxaMediaFaixa1e2
      : feature.properties.Taxa_Faixa_1_e_2

    if (taxa === undefined || taxa === null) {
      return {
        color: "#6b7280",
        weight: 0.5,
        fillColor: "#f3f4f6",
        fillOpacity: 0.3 * opacidade,
        opacity: opacidade,
      }
    }

    let color = "#10b981"
    if (taxa >= 15 && taxa <= 25) color = "#f59e0b"
    if (taxa > 25) color = "#ef4444"

    return {
      color: "#000000",
      weight: 0.5,
      fillColor: color,
      fillOpacity: 0.9 * opacidade,
      opacity: opacidade,
    }
  }

  const config = CAMADAS_DISPONIVEIS[id]
  if (!config) {
    return {
      color: "#3388ff",
      weight: 0.5,
      fillOpacity: 0.3 * opacidade,
      opacity: opacidade,
    }
  }

  const estilo = config.estilo as {
    color?: string
    weight?: number
    fillOpacity?: number
    opacity?: number
  }

  const estiloBase = {
    ...estilo,
    opacity: estilo.opacity ?? opacidade,
  }

  switch (config.geometry) {
    case "linha":
      return {
        ...estiloBase,
        fillOpacity: 0,
        weight: estiloBase.weight ?? 1,
      }

    case "ponto":
      return {
        ...estiloBase,
        radius: 3,
        fillOpacity: (estiloBase.fillOpacity ?? 0.8) * opacidade,
        weight: estiloBase.weight ?? 1,
      }

    case "area":
    case "desconhecido":
    default:
      return {
        ...estiloBase,
        fillOpacity: (estiloBase.fillOpacity ?? 0.3) * opacidade,
        weight: estiloBase.weight ?? 1,
      }
  }
}
