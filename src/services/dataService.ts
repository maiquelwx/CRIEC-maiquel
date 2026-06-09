import type { FeatureCollection } from "geojson"

// Camadas disponíveis 
export interface CamadaConfig {
  id: string
  label: string
  estilo: object
  temporal?: boolean
}

export interface CadUnicoPeriodo {
  id: string
  label: string
  fonte: string
}

export const BASE_LAYER_IDS = ["municipios", "bacias", "curvas_nivel"] as const
export type BaseLayerId = (typeof BASE_LAYER_IDS)[number]

export const CAMADAS_DISPONIVEIS: Record<string, CamadaConfig> = {
  municipios: {
    id: "municipios",
    label: "Municípios",
    estilo: {
      color: "#3b82f6",
      weight: 1,
      fillOpacity: 0.15,
    },
  },
  bacias: {
    id: "bacias",
    label: "Bacias Hidrográficas",
    estilo: {
      color: "#10b981",
      weight: 2,
      fillOpacity: 0.2,
    },
  },
  cadunico: {
    id: "cadunico",
    label: "CadÚnico",
    temporal: true,
    estilo: {
      color: "#f59e0b",
      weight: 1,
      fillOpacity: 0.15,
    },
  },
  // Em CAMADAS_DISPONIVEIS, registrar cada uma:
  curvas_nivel: {
    id: "curvas_nivel",
    label: "Curvas de Nível",
    estilo: {
      color: "#8b5cf6",
      weight: 1,
      opacity: 0.6,
    },
  },
  localidades: {
    id: "localidades",
    label: "Localidades",
    estilo: {
      color: "#f43f5e",
      weight: 1,
      fillOpacity: 0.8,
    },
  },
  area_afetada_2024: {
    id: "area_afetada_2024",
    label: "Área Afetada 2024",
    estilo: {
      color: "#f59e0b",
      weight: 1,
      fillOpacity: 0.3,
    },
  },
}

export const obterCamadasBase = () =>
  Object.values(CAMADAS_DISPONIVEIS).filter((c) =>
    BASE_LAYER_IDS.includes(c.id as BaseLayerId)
  )

export const obterCamadasTematicas = () =>
  Object.values(CAMADAS_DISPONIVEIS).filter(
    (c) => !BASE_LAYER_IDS.includes(c.id as BaseLayerId)
  )

const CADUNICO_PERIODOS: CadUnicoPeriodo[] = Array.from(
  { length: new Date().getFullYear() - 2012 + 1 },
  (_, i) => {
    const ano = String(new Date().getFullYear() - i)
    return {
      id: ano,
      label: ano,
      fonte: "/data/json/cadunico_preview.geojson",
      //fonte: "/src/data/json/CadUnico_RS_Completo.geojson",
    }
  }
)

// Arquivos originais (não funcionam após o build)
// const FONTES_LOCAIS: Record<string, string> = {
//   municipios: "/src/data/json/Divisão_Municipal_RS.geojson",
//   bacias: "/src/data/json/Regiões_Hidrográficas_RS.geojson",
//   curvas_nivel: "/src/data/json/curvas_nivel_preview.json",
//   localidades: "/src/data/json/loc_cidade_p.json",
//   area_afetada_2024: "/src/data/json/area_diretamente_atingida_2024.json",
// }

// Arquivos usados na versão de preview (public/data/json)
const FONTES_LOCAIS: Record<string, string> = {
  municipios: "/data/json/municipios_preview.geojson",
  bacias: "/data/json/bacias_preview.geojson",
  curvas_nivel: "/data/json/curvas_nivel_preview.json",
  localidades: "/data/json/localidades_preview.json",
  area_afetada_2024: "/data/json/area_afetada_2024_preview.json",
}

// Essa é a única função q o mapa chama
// Quando o DuckDB estiver pronto tem q trocar o fetch por uma chamada API aqui

export function obterPeriodosCadUnico() {
  return CADUNICO_PERIODOS
}

function obterFonteCadUnico(periodo: string) {
  return (
    CADUNICO_PERIODOS.find((item) => item.id === periodo)?.fonte ??
    CADUNICO_PERIODOS[0].fonte
  )
}

export async function fetchCamada(
  id: string,
  periodoCadUnico = CADUNICO_PERIODOS[0].id
): Promise<FeatureCollection> {
  const url =
    id === "cadunico"
      ? obterFonteCadUnico(periodoCadUnico)
      : FONTES_LOCAIS[id]
  if (!url) throw new Error(`Camada "${id}" não encontrada`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao carregar camada "${id}": ${res.status}`)

  const json: FeatureCollection = await res.json()

  if (id === "curvas_nivel") {
    console.warn(`curvas_nivel: ${json.features.length} features — limitando a 100 para preview`)
    return { ...json, features: json.features.slice(0, 100) }
  }

  let filtrado = json
  if (id === "cadunico") {
    filtrado = {
      ...json,
      features: json.features.filter((feature) => {
        const referencia = feature.properties?.Referencia as string
        if (!referencia) return false

        const ano = referencia.split("/")[1]
        return ano === periodoCadUnico
      }),
    }
  }

  return filtrado
}

