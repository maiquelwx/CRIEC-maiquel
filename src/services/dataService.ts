import type { FeatureCollection } from "geojson"
import fontesDados from "@/data/fontes_dados.json"
import camadasDisponiveis from "@/data/camadas_disponiveis.json"

const DEFAULT_LAYER_STYLE = {
  color: "#64748b",
  weight: 1,
  fillOpacity: 0.2,
}

function resolverUrlBackend(url: string) {
  return url
}

const FONTES_INTERNAS = Object.keys(
  (fontesDados as { fontes?: Record<string, Record<string, string>> }).fontes
    ?.interno ?? {}
)

// Camadas disponíveis 
export interface CamadaConfig {
  id: string
  label: string
  estilo: object
  geometry?: "ponto" | "linha" | "area" | "desconhecido"
  temporal?: boolean
  grupo?: string
}

export interface CadUnicoPeriodo {
  id: string
  label: string
  fonte: string
}

export interface VariavelCatalogo {
  id: number
  codigo: string
  nome: string
  unidade: string | null
  descricao: string | null
}

export interface VariavelValorRegistro {
  codigo: string
  nome: string
  [codigoVariavel: string]: string | number | boolean | null
}

export interface VariavelValoresResposta {
  ano: number
  variaveis: string[]
  valores: VariavelValorRegistro[]
}

export interface GrupoCamada {
  key: string
  label: string
}

export const BASE_LAYER_IDS = FONTES_INTERNAS as readonly string[]
export type BaseLayerId = (typeof BASE_LAYER_IDS)[number]

export const GRUPOS_CAMADAS: GrupoCamada[] = [
  { key: "geograficas", label: "Geográficas" },
  { key: "sociais", label: "Sociais" },
  { key: "saude", label: "Saúde e serviços" },
  { key: "hidrologia", label: "Hidrologia e ambiente" },
  { key: "economicas", label: "Econômicas" },
  { key: "outros", label: "Outros" },
]

function formatarLabelCamada(id: string) {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function inferirGrupoCamada(id: string, label: string) {
  const termos = `${id} ${label}`.toLowerCase()

  if (/(municip|setor|bacia|curva|localidade|limite|regio|area|arroio|delta|inundacao|territ|geo)/.test(termos)) {
    return "geograficas"
  }

  if (/(cadunico|idese|renda|populacao|envelhecimento|partos|cobertura|cras|creas|social|desastre|ocorrencia|mortalid)/.test(termos)) {
    return "sociais"
  }

  if (/(leito|hospital|saude|ubs|upas|covid|dengue|febre|zika|chikungunya|coronavirus|mort|mortalid)/.test(termos)) {
    return "saude"
  }

  if (/(hidro|barragem|agua|esgoto|vazao|balanco|batimetria|inundacao|bacia)/.test(termos)) {
    return "hidrologia"
  }

  if (/(econom|renda|servico|infra|desenvolv)/.test(termos)) {
    return "economicas"
  }

  return "outros"
}

const FONTES_LOCAIS: Record<string, string> = Object.values(
  (fontesDados as { fontes?: Record<string, Record<string, string>> }).fontes ?? {}
).reduce<Record<string, string>>((acumulador, grupo) => {
  Object.entries(grupo ?? {}).forEach(([id, url]) => {
    acumulador[id] = resolverUrlBackend(url)
  })
  return acumulador
}, {})

const ALIAS_FONTES: Record<string, string> = {
  bacias: "bacias_hidrograficas",
  regioes: "regioes_hidrograficas",
}

export const CAMADAS_COM_BBOX = new Set([
  "curvas_nivel",
  "setores_censitarios_banco",
  "setores_censitarios",
  "setores_censitarios_local",
  "setores_censitarios_completo",
  "setores_censitarios_simplificado",
  "municipios",
  "bacias",
  "bacias_hidrograficas",
])

Object.entries(ALIAS_FONTES).forEach(([alias, origem]) => {
  if (FONTES_LOCAIS[origem]) {
    FONTES_LOCAIS[alias] = FONTES_LOCAIS[origem]
  }
})

const camadasDisponiveisMap = camadasDisponiveis as Record<string, CamadaConfig>

const catalogoBase = FONTES_INTERNAS.map((id) => {
  const camada = camadasDisponiveisMap[id]

  return [
    id,
    ({
      id,
      label: camada?.label ?? formatarLabelCamada(id),
      estilo: camada?.estilo ?? DEFAULT_LAYER_STYLE,
      geometry: camada?.geometry ?? "desconhecido",
      temporal: camada?.temporal,
      grupo: camada?.grupo ?? inferirGrupoCamada(id, camada?.label ?? id),
    } as CamadaConfig),
  ] as const
})

const catalogoFallback = Object.entries(FONTES_LOCAIS)
  .filter(([id]) => !(camadasDisponiveis as Record<string, CamadaConfig>)[id])
  .map(([id]) => [
    id,
    ({
      id,
      label: formatarLabelCamada(id),
      estilo: DEFAULT_LAYER_STYLE,
      geometry: "desconhecido",
      grupo: inferirGrupoCamada(id, formatarLabelCamada(id)),
    } as CamadaConfig),
  ])

export const CAMADAS_DISPONIVEIS: Record<string, CamadaConfig> = Object.fromEntries(
  [...catalogoBase, ...catalogoFallback]
) as Record<string, CamadaConfig>

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

// Essa é a única função q o mapa chama
export function obterPeriodosCadUnico() {
  return CADUNICO_PERIODOS
}

function obterFonteCadUnico(periodo: string) {
  return (
    CADUNICO_PERIODOS.find((item) => item.id === periodo)?.fonte ??
    CADUNICO_PERIODOS[0].fonte
  )
}

const API_BASE_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ""

const FALLBACK_API_BASE_URL = (() => {
  const primeiraFonteInterna = Object.values(
    (fontesDados as { fontes?: Record<string, Record<string, string>> }).fontes?.interno ?? {}
  )[0]

  if (!primeiraFonteInterna) return ""

  try {
    return new URL(primeiraFonteInterna).origin
  } catch {
    return ""
  }
})()

function montarUrlApi(caminho: string) {
  const caminhoNormalizado = caminho.startsWith("/") ? caminho : `/${caminho}`
  const baseUrl = API_BASE_URL || FALLBACK_API_BASE_URL
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${caminhoNormalizado}` : caminhoNormalizado
}

export async function fetchVariaveis(tipoObjeto: string, limite = 10): Promise<VariavelCatalogo[]> {
  const url = montarUrlApi(`/variaveis/${tipoObjeto}?${new URLSearchParams({ limite: String(limite) }).toString()}`)
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Erro ao carregar variáveis de "${tipoObjeto}": ${res.status}`)
  }

  return (await res.json()) as VariavelCatalogo[]
}

export async function fetchValoresVariaveis(
  tipoObjeto: string,
  variaveis: string,
  ano: number,
  bbox?: string
): Promise<VariavelValoresResposta> {
  const query = new URLSearchParams({ variaveis, ano: String(ano) })
  if (bbox) {
    query.set("bbox", bbox)
  }

  const url = montarUrlApi(`/variaveis/${tipoObjeto}/valores?${query.toString()}`)
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Erro ao carregar valores de "${tipoObjeto}": ${res.status}`)
  }

  return (await res.json()) as VariavelValoresResposta
}

export async function fetchCamada(
  id: string,
  periodoCadUnico = CADUNICO_PERIODOS[0].id,
  bbox?: string
): Promise<FeatureCollection> {
  const fonteId = ALIAS_FONTES[id] ?? id
  const url = 
    id === "cadunico"
      ? obterFonteCadUnico(periodoCadUnico)
      : FONTES_LOCAIS[fonteId]
  if (!url) throw new Error(`Camada "${id}" não encontrada`)

  const urlComParametros = bbox && CAMADAS_COM_BBOX.has(id)
    ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams({ bbox }).toString()}`
    : url

  const res = await fetch(urlComParametros)
  if (!res.ok) throw new Error(`Erro ao carregar camada "${id}": ${res.status}`)

  const json: FeatureCollection = await res.json()

  if (id === "curvas_nivel" && !bbox) {
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

