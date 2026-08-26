import { CAMADAS_DISPONIVEIS } from "@/services/dataService"

type FeatureComPropriedades = {
  properties?: Record<string, unknown>
}

export function estiloCamada(id: string, opacidade: number, feature?: FeatureComPropriedades): Record<string, unknown> {
  if ((id === "cadunico" || id === "combinado" || id === "bacias_combinado") && feature?.properties) {
    const taxaBruta = id === "bacias_combinado"
      ? feature.properties.taxaMediaFaixa1e2
      : feature.properties.Taxa_Faixa_1_e_2
    const taxa = Number(taxaBruta)

    if (!Number.isFinite(taxa)) {
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

// Catálogo de rampas sequenciais disponíveis para o usuário escolher —
// todas de 6 classes, ColorBrewer, perceptualmente uniformes e testadas
// para daltonismo (exceto onde indicado).
export const PALETAS_VARIAVEL = {
  vermelho: { label: "Vermelho (mono)", cores: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"] },
  magenta: { label: "Magenta (mono)", cores: ["#fddde6", "#f7b6c8", "#f28cb0", "#e75480", "#c2185b", "#880e4f"] },
  roxo: { label: "Roxo (mono)", cores: ["#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"] },
  laranja: { label: "Laranja (mono)", cores: ["#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"] },
  ciano: { label: "Ciano (mono)", cores: ["#e0f3f8", "#b3e2e2", "#80cdc1", "#4eb3b3", "#2c8c8c", "#016c59"] },
} as const

export type PaletaVariavelKey = keyof typeof PALETAS_VARIAVEL

const RAMPA_PADRAO = PALETAS_VARIAVEL.vermelho.cores

function hexParaRgb(hex: string) {
  const limpo = hex.replace("#", "")
  return {
    r: parseInt(limpo.substring(0, 2), 16),
    g: parseInt(limpo.substring(2, 4), 16),
    b: parseInt(limpo.substring(4, 6), 16),
  }
}

export function corRampaSequencial(t: number, rampa: readonly string[] = RAMPA_PADRAO): string {
  const clamped = Math.min(1, Math.max(0, t))
  const escalaIndice = clamped * (rampa.length - 1)
  const indiceBase = Math.floor(escalaIndice)
  const indiceProximo = Math.min(rampa.length - 1, indiceBase + 1)
  const fracao = escalaIndice - indiceBase

  const corBase = hexParaRgb(rampa[indiceBase])
  const corProxima = hexParaRgb(rampa[indiceProximo])

  const r = Math.round(corBase.r + (corProxima.r - corBase.r) * fracao)
  const g = Math.round(corBase.g + (corProxima.g - corBase.g) * fracao)
  const b = Math.round(corBase.b + (corProxima.b - corBase.b) * fracao)

  return `rgb(${r} ${g} ${b})`
}

export function estiloSetorComVariavel(
  feature: FeatureComPropriedades,
  opacidade: number,
  maxValor: number,
  paleta: readonly string[] = RAMPA_PADRAO
): Record<string, unknown> {
  const valor = Number(feature?.properties?.valorSelecionado)

  if (!Number.isFinite(valor)) {
    return {
      color: "#6b7280",
      weight: 0.6,
      fillColor: "#f3f4f6",
      fillOpacity: 0.25 * opacidade,
      opacity: opacidade,
    }
  }

  const escala = maxValor > 0 ? Math.min(1, Math.max(0, valor / maxValor)) : 0

  return {
    color: "#1f2937",
    weight: 0.6,
    fillColor: corRampaSequencial(escala, paleta),
    fillOpacity: (0.35 + 0.45 * escala) * opacidade,
    opacity: opacidade,
  }
}