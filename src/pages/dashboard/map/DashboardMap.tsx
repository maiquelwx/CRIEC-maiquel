import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import { useMap } from "react-leaflet"
import type { FeatureCollection } from "geojson"
import { fetchCamada, fetchValoresVariaveis, CAMADAS_DISPONIVEIS, CAMADAS_COM_BBOX } from "@/services/dataService"
import {
  getLayerKey,
  buildCadUnicoMap,
  combineMunicipiosWithCadUnico,
  combineBaciasWithCadUnico,
  combineSetoresWithVariavel,
  combineTwoLayers,
  calcularEstatisticasVariavel,
} from "./mapHelpers"
import type { EstatisticasVariavel } from "./mapHelpers"
import { estiloCamada, estiloSetorComVariavel, PALETAS_VARIAVEL, type PaletaVariavelKey } from "./styleHelpers"
import L from "leaflet"

interface DashboardMapProps {
  camadas: string[]
  opacidade: number
  periodoCadUnico: string
  variavelSetorSelecionada?: string
  sidebarAberto?: boolean
  // Notifica o componente pai (para uso no painel de variáveis) sempre que as
  // estatísticas da variável ativa mudam — min/max/média/histograma calculados
  // a partir dos mesmos dados já buscados para colorir o mapa (sem fetch extra).
  onVariavelStatsChange?: (stats: EstatisticasVariavel | null) => void
  paletaVariavel?: PaletaVariavelKey
}

// ---------------------------------------------------------------------------
// Helpers de bbox: usados para dar margem ao viewport, verificar se uma área
// já foi coberta por um fetch anterior, e mesclar (unir) envelopes.
// ---------------------------------------------------------------------------

type Bbox = [number, number, number, number] // [xmin, ymin, xmax, ymax]

// Quanto de margem extra buscar além do viewport visível (0.5 = 50% para cada lado)
const MARGEM_BBOX = 0.5
// Tempo de espera após o usuário parar de mover o mapa antes de buscar dados novos
const DEBOUNCE_MOVIMENTO_MS = 400
const SETOR_LAYER_IDS = new Set([
  "setores_censitarios_banco",
  "setores_censitarios",
  "setores_censitarios_local",
  "setores_censitarios_completo",
  "setores_censitarios_simplificado",
])

function parseBbox(bbox: string): Bbox {
  const [xmin, ymin, xmax, ymax] = bbox.split(",").map(Number) as Bbox
  return [xmin, ymin, xmax, ymax]
}

function bboxToString(bbox: Bbox): string {
  return bbox.join(",")
}

function padBbox(bbox: Bbox, fator: number): Bbox {
  const [xmin, ymin, xmax, ymax] = bbox
  const larguraExtra = (xmax - xmin) * fator
  const alturaExtra = (ymax - ymin) * fator
  return [xmin - larguraExtra, ymin - alturaExtra, xmax + larguraExtra, ymax + alturaExtra]
}

// outer "contém" inner se inner está totalmente dentro de outer
function bboxContains(outer: Bbox, inner: Bbox): boolean {
  return outer[0] <= inner[0] && outer[1] <= inner[1] && outer[2] >= inner[2] && outer[3] >= inner[3]
}

function unionBbox(a: Bbox, b: Bbox): Bbox {
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]
}

// Mescla duas FeatureCollections, removendo duplicatas pelo campo "codigo"
// (que o backend sempre inclui em properties). Cai para JSON.stringify da
// geometria como chave de fallback caso "codigo" não exista.
function mergeFeatureCollections(
  existente: FeatureCollection | undefined,
  novo: FeatureCollection
): FeatureCollection {
  const mapa = new Map<string, FeatureCollection["features"][number]>()

  existente?.features.forEach((feature) => {
    const id = feature?.properties?.codigo ?? JSON.stringify(feature.geometry)
    mapa.set(id, feature)
  })

  novo.features.forEach((feature) => {
    const id = feature?.properties?.codigo ?? JSON.stringify(feature.geometry)
    mapa.set(id, feature)
  })

  return {
    type: "FeatureCollection",
    features: Array.from(mapa.values()),
  }
}

function MapResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap()

  useEffect(() => {
    const invalidate = () => {
      window.requestAnimationFrame(() => {
        map.invalidateSize({ pan: false })
      })
    }

    invalidate()

    const timer = window.setTimeout(invalidate, 120)

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => invalidate())
      : null

    const container = map.getContainer()
    resizeObserver?.observe(container)
    window.addEventListener("resize", invalidate)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", invalidate)
      window.clearTimeout(timer)
    }
  }, [map, trigger])

  return null
}

// Emite o bbox do viewport (com margem extra) sempre que o mapa para de se
// mover, com debounce para não disparar fetch a cada pixel de movimento.
function ViewportBboxHandler({
  ativo,
  onBboxChange,
}: {
  ativo: boolean
  onBboxChange: (bbox: string) => void
}) {
  const map = useMap()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!ativo) return

    const atualizarBbox = () => {
      const bounds = map.getBounds()
      const bboxViewport: Bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]
      const bboxComMargem = padBbox(bboxViewport, MARGEM_BBOX)
      onBboxChange(bboxToString(bboxComMargem))
    }

    const atualizarComDebounce = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(atualizarBbox, DEBOUNCE_MOVIMENTO_MS)
    }

    // Primeira carga: sem debounce, para não atrasar a exibição inicial
    atualizarBbox()
    map.on("moveend", atualizarComDebounce)

    return () => {
      map.off("moveend", atualizarComDebounce)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [ativo, map, onBboxChange])

  return null
}

// Depois que dados novos chegam via fetch assíncrono (fora do ciclo nativo de
// eventos do Leaflet), o mapa às vezes não repinta as camadas sozinho.
// Um "nudge" de 0px força o Leaflet a redesenhar sem mover a visualização.
function ForcarRedesenhoAoAtualizar({ gatilho }: { gatilho: string }) {
  const map = useMap()

  useEffect(() => {
    map.panBy([0, 0], { animate: false })
  }, [gatilho, map])

  return null
}

function ZoomControl() {
  const map = useMap()

  return (
    <div className="absolute bottom-1/2 left-4 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background/95 shadow-md backdrop-blur transition hover:bg-muted"
        aria-label="Aproximar"
      >
        <span className="text-base leading-none">+</span>
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background/95 shadow-md backdrop-blur transition hover:bg-muted"
        aria-label="Afastar"
      >
        <span className="text-base leading-none">−</span>
      </button>
    </div>
  )
}

// Legenda para CadÚnico
const LegendaCadUnico = () => (
  <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-border/70 bg-background/85 p-3 shadow-sm backdrop-blur">
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Faixa de Renda</div>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="h-3 w-4 rounded" style={{ backgroundColor: "#f3f4f6" }}></div>
        <span className="text-xs">Sem dados</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
        <span className="text-xs">Baixa (&lt; 15%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-4 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
        <span className="text-xs">Média (15-25%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
        <span className="text-xs">Alta (&gt; 25%)</span>
      </div>
    </div>
  </div>
)

// Legenda para a variável de setor censitário ativa — usa o mesmo mapeamento
// de matiz (hue) de estiloSetorComVariavel, para que a leitura no painel bata
// exatamente com o que está pintado no mapa.
const LegendaVariavelSetor = ({
  codigo,
  stats,
  cores,
}: {
  codigo: string
  stats: EstatisticasVariavel
  cores: readonly string[]
}) => (
  <div className="absolute bottom-4 left-4 z-[1000] w-48 rounded-xl border border-border/70 bg-background/85 p-3 shadow-sm backdrop-blur">
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      Variável {codigo}
    </div>
    <div
      className="h-2.5 w-full rounded-full"
      style={{ background: `linear-gradient(to right, ${cores.join(", ")})` }}
    />
    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
      <span>{Math.round(stats.min).toLocaleString()}</span>
      <span>{Math.round(stats.max).toLocaleString()}</span>
    </div>
    <div className="mt-1.5 text-[10px] text-muted-foreground/80">
      {stats.total.toLocaleString()} setores · média {Math.round(stats.media).toLocaleString()}
    </div>
  </div>
)

export function DashboardMap({ camadas, opacidade, periodoCadUnico, variavelSetorSelecionada, sidebarAberto, onVariavelStatsChange, paletaVariavel = "vermelho" }: DashboardMapProps) {
  const coresPaleta = PALETAS_VARIAVEL[paletaVariavel].cores
  const [dados, setDados] = useState<Record<string, FeatureCollection>>({})
  const [carregando, setCarregando] = useState<Record<string, boolean>>({})
  const [erros, setErros] = useState<Record<string, boolean>>({})
  const [erroVisivel, setErroVisivel] = useState(true)
  const [bboxAtual, setBboxAtual] = useState<string | null>(null)
  // Contador de versão por key: incrementado a cada merge de dados novos,
  // usado para forçar o remount da <GeoJSON> (ela não reage a mudanças em "data").
  const [versoes, setVersoes] = useState<Record<string, number>>({})
  const requestIds = useRef<Record<string, number>>({})
  // Envelope (bbox) já coberto por fetches anteriores, por key de camada.
  // Enquanto o viewport atual estiver contido nesse envelope, não refazemos o fetch.
  const envelopesRef = useRef<Record<string, Bbox>>({})
  const camadaSetorAtiva = camadas.find((id) => SETOR_LAYER_IDS.has(id))
  const keySetorAtivo = camadaSetorAtiva ? getLayerKey(camadaSetorAtiva, periodoCadUnico) : null
  const keySetorVariavel = camadaSetorAtiva && variavelSetorSelecionada
    ? `${getLayerKey(camadaSetorAtiva, periodoCadUnico)}:variavel:${variavelSetorSelecionada}:${bboxAtual ?? "full"}`
    : null
  const dadosSetorVariavel = keySetorVariavel ? dados[keySetorVariavel] : undefined
  const dadosSetorBase = keySetorAtivo ? dados[keySetorAtivo] : undefined
  const setorVariavelCarregando = keySetorVariavel ? Boolean(carregando[keySetorVariavel]) : false

  // Estatísticas (min/max/média/histograma) calculadas a partir dos mesmos
  // dados já buscados para colorir o mapa — alimenta tanto a legenda do mapa
  // quanto o painel de variáveis, sem nenhum fetch adicional.
  const estatisticasVariavelSetor = useMemo(
    () => calcularEstatisticasVariavel(dadosSetorVariavel),
    [dadosSetorVariavel]
  )
  const maxValorVariavelSetor = estatisticasVariavelSetor?.max ?? 0

  useEffect(() => {
    onVariavelStatsChange?.(estatisticasVariavelSetor)
  }, [estatisticasVariavelSetor, onVariavelStatsChange])

  const carregarCamada = useCallback((id: string, key: string, bbox?: string, mesclar = false) => {
    const requestId = (requestIds.current[key] = (requestIds.current[key] ?? 0) + 1)
    setCarregando((ant) => ({ ...ant, [key]: true }))
    fetchCamada(id, periodoCadUnico, bbox)
      .then((json) => {
        if (requestIds.current[key] !== requestId) return

        if (mesclar) {
          setDados((ant) => ({ ...ant, [key]: mergeFeatureCollections(ant[key], json) }))
          if (bbox) {
            const bboxBuscado = parseBbox(bbox)
            envelopesRef.current[key] = envelopesRef.current[key]
              ? unionBbox(envelopesRef.current[key], bboxBuscado)
              : bboxBuscado
          }
          setVersoes((ant) => ({ ...ant, [key]: (ant[key] ?? 0) + 1 }))
        } else {
          setDados((ant) => ({ ...ant, [key]: json }))
        }

        setErros((ant) => ({ ...ant, [key]: false }))
      })
      .catch((err) => {
        if (requestIds.current[key] !== requestId) return
        console.error(`Erro ao carregar camada "${id}" (key="${key}"):`, err)
        setErros((ant) => ({ ...ant, [key]: true }))
        setErroVisivel(true)
      })
      .finally(() => {
        if (requestIds.current[key] !== requestId) return
        setCarregando((ant) => ({ ...ant, [key]: false }))
      })
  }, [periodoCadUnico])

  const carregarInterseccaoSetorVariavel = useCallback(async () => {
    if (!camadaSetorAtiva || !variavelSetorSelecionada || !keySetorAtivo) {
      return
    }

    if (!dadosSetorBase) {
      return
    }

    if (dadosSetorVariavel || setorVariavelCarregando) {
      return
    }

    const requestKey = keySetorVariavel ?? `${keySetorAtivo}:variavel:${variavelSetorSelecionada}:${bboxAtual ?? "full"}`
    const requestId = (requestIds.current[requestKey] = (requestIds.current[requestKey] ?? 0) + 1)
    const bboxConsulta = bboxAtual ?? undefined

    setCarregando((ant) => ({ ...ant, [requestKey]: true }))

    try {
      const resposta = await fetchValoresVariaveis("setor_censitario", variavelSetorSelecionada, 2022, bboxConsulta)
      if (requestIds.current[requestKey] !== requestId) return

      const combinado = combineSetoresWithVariavel(dadosSetorBase, resposta.valores, variavelSetorSelecionada)
      setDados((ant) => ({ ...ant, [requestKey]: combinado }))
      setErros((ant) => ({ ...ant, [requestKey]: false }))
      setVersoes((ant) => ({ ...ant, [requestKey]: (ant[requestKey] ?? 0) + 1 }))
    } catch (err) {
      if (requestIds.current[requestKey] !== requestId) return
      console.error(`Erro ao carregar valores da variável "${variavelSetorSelecionada}":`, err)
      setErros((ant) => ({ ...ant, [requestKey]: true }))
      setErroVisivel(true)
    } finally {
      if (requestIds.current[requestKey] === requestId) {
        setCarregando((ant) => ({ ...ant, [requestKey]: false }))
      }
    }
  }, [camadaSetorAtiva, variavelSetorSelecionada, keySetorAtivo, keySetorVariavel, bboxAtual, dadosSetorBase, dadosSetorVariavel, setorVariavelCarregando])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void carregarInterseccaoSetorVariavel()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [carregarInterseccaoSetorVariavel])

  const getPointToLayer = (id: string) => {
    const config = CAMADAS_DISPONIVEIS[id]
    if (config?.geometry !== "ponto") return undefined

    return (feature: { properties?: Record<string, unknown> }, latlng: L.LatLng) =>
      L.circleMarker(latlng, estiloCamada(id, opacidade, feature))
  }

  const formatTooltipValue = (value: unknown) => {
    if (value === null || value === undefined) return "–"
    if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString() : String(value)
    if (typeof value === "boolean") return value ? "Sim" : "Não"
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  const normalizeTooltipKey = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b([a-z])/g, (match) => match.toUpperCase())

  const buildFeatureTooltip = (
    id: string,
    feature: { properties?: Record<string, unknown> } | undefined,
    variavelSelecionada?: string
  ) => {
    const props = feature?.properties
    if (!props || typeof props !== "object") return undefined
    const propsRecord = props as Record<string, unknown>

    const primaryLabel =
      propsRecord.Municipio || propsRecord.NM_MUN || propsRecord.Nome || propsRecord.nome || propsRecord.name || propsRecord.regiao || propsRecord.localidade || propsRecord.LOCALIDADE
    const config = CAMADAS_DISPONIVEIS[id]
    const layerName = config?.label || id
    const codigoSetor =
      propsRecord.codigo ||
      propsRecord.CD_SETOR ||
      propsRecord.codarea ||
      propsRecord.CD_MUN ||
      propsRecord.codigo_setor

    const lines: string[] = [`<b>${primaryLabel || layerName}</b>`]

    if (SETOR_LAYER_IDS.has(id) && codigoSetor !== undefined) {
      lines.push(`Código do setor: ${formatTooltipValue(codigoSetor)}`)
    }

    if (SETOR_LAYER_IDS.has(id) && variavelSelecionada) {
      const valorVariavel = propsRecord.valorSelecionado ?? propsRecord[variavelSelecionada]

      if (valorVariavel !== undefined) {
        lines.push(
          `Variável ${normalizeTooltipKey(variavelSelecionada)}: ${formatTooltipValue(valorVariavel)}`
        )
        return lines.join("<br/>")
      }
    }

    if (id === "cadunico") {
      const populacao = propsRecord.Populacao
      const faixa1 = propsRecord.Faixa_1
      const taxaFaixa1 = propsRecord.Taxa_Faixa_1
      const faixa1e2 = propsRecord.Faixa_1_e_2
      const taxaFaixa1e2 = propsRecord.Taxa_Faixa_1_e_2

      if (populacao !== undefined) {
        lines.push(`População: ${formatTooltipValue(populacao)}`)
      }
      if (faixa1 !== undefined && taxaFaixa1 !== undefined) {
        lines.push(`Faixa 1: ${formatTooltipValue(faixa1)} (${formatTooltipValue(taxaFaixa1)}%)`)
      }
      if (faixa1e2 !== undefined && taxaFaixa1e2 !== undefined) {
        lines.push(`Faixa 1+2: ${formatTooltipValue(faixa1e2)} (${formatTooltipValue(taxaFaixa1e2)}%)`)
      }
      return lines.length > 1 ? lines.join("<br/>") : undefined
    }

    const specialPropertyKeys = [
      "municipio",
      "nm_mun",
      "nome",
      "name",
      "regiao",
      "populacao",
      "Area",
      "area",
      "id",
    ]
    const nomesVariaveis: Record<string, string> = {
      V0001: "Total de pessoas",
      V0002: "Total de domicílios",
      V0003: "Total de domicílios particulares",
      V0004: "Total de domicílios coletivos",
      V0005: "Média de moradores por domicílio",
      V0006: "% de domicílios ocupados imputados",
      V0007: "Total de domicílios particulares ocupados",
    }

    const isUninterestingProperty = (key: string) =>
      key === "geometry" ||
      key === "type" ||
      key === "codigo" ||
      key === "valorSelecionado" ||
      key === "codigoVariavelSelecionada" ||
      (/^CD_/i.test(key) && !["CD_MUN"].includes(key.toUpperCase()))

    const entries = Object.entries(propsRecord)
      .filter(([key, value]) => !isUninterestingProperty(key) && value !== null && value !== undefined && value !== "")
      .sort(([a], [b]) => {
        const aIndex = specialPropertyKeys.indexOf(a.toLowerCase())
        const bIndex = specialPropertyKeys.indexOf(b.toLowerCase())
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      .slice(0, 16)

    entries.forEach(([key, value]) => {
      if (key === "Municipio" || key === "NM_MUN" || key === "Nome" || key === "nome" || key === "name" || key === "regiao" || key === "localidade" || key === "LOCALIDADE") {
        return
      }
      lines.push(
        `${nomesVariaveis[key.toUpperCase()] ?? normalizeTooltipKey(key)}: ${formatTooltipValue(value)}`
      )
    })

    return lines.length > 1 ? lines.join("<br/>") : undefined
  }

  useEffect(() => {
    camadas.forEach((id) => {
      const key = getLayerKey(id, periodoCadUnico)
      const precisaBbox = CAMADAS_COM_BBOX.has(id)

      if (precisaBbox) {
        if (!bboxAtual || carregando[key]) return

        const viewportBbox = parseBbox(bboxAtual)
        const envelope = envelopesRef.current[key]

        // Se a área atual já está totalmente coberta pelo que já foi buscado
        // antes, não refaz o fetch — só reaproveita o que já está em "dados".
        if (envelope && bboxContains(envelope, viewportBbox)) return

        carregarCamada(id, key, bboxAtual, true)
        return
      }

      if (dados[key] || carregando[key] || erros[key]) return
      carregarCamada(id, key)
    })

    if (camadas.includes("bacias") && camadas.includes("cadunico") && !dados["municipios"] && !erros["municipios"]) {
      const requestIdMunicipios = (requestIds.current.municipios = (requestIds.current.municipios ?? 0) + 1)

      fetchCamada("municipios", periodoCadUnico)
        .then((json) => {
          if (requestIds.current.municipios !== requestIdMunicipios) return
          setDados((ant) => ({ ...ant, municipios: json }))
          setErros((ant) => ({ ...ant, municipios: false }))
        })
        .catch((err) => {
          if (requestIds.current.municipios !== requestIdMunicipios) return
          console.error('Erro ao carregar camada "municipios" (key="municipios"):', err)
          setErros((ant) => ({ ...ant, municipios: true }))
          setErroVisivel(true)
        })
    }

    if (camadas.includes("municipios") && camadas.includes("cadunico")) {
      const keyMunicipios = "municipios"
      const keyCadUnico = getLayerKey("cadunico", periodoCadUnico)
      const keyCombinado = `combinado:${periodoCadUnico}`

      if (dados[keyMunicipios] && dados[keyCadUnico] && !dados[keyCombinado] && !carregando[keyCombinado]) {
        const municipios = dados[keyMunicipios] as FeatureCollection
        const cadunico = dados[keyCadUnico] as FeatureCollection
        const combinado = combineMunicipiosWithCadUnico(municipios, buildCadUnicoMap(cadunico))

        queueMicrotask(() => {
          setDados((ant) => ({ ...ant, [keyCombinado]: combinado }))
        })
      }
    }

    if (camadas.includes("bacias") && camadas.includes("cadunico")) {
      const keyBacias = "bacias"
      const keyMunicipios = "municipios"
      const keyCadUnico = getLayerKey("cadunico", periodoCadUnico)
      const keyCombinado = `bacias_combinado:${periodoCadUnico}`

      if (dados[keyBacias] && dados[keyMunicipios] && dados[keyCadUnico] && !dados[keyCombinado] && !carregando[keyCombinado]) {
        const bacias = dados[keyBacias] as FeatureCollection
        const municipios = dados[keyMunicipios] as FeatureCollection
        const cadunico = dados[keyCadUnico] as FeatureCollection
        const combinado = combineBaciasWithCadUnico(bacias, municipios, cadunico)

        queueMicrotask(() => {
          setDados((ant) => ({ ...ant, [keyCombinado]: combinado }))
        })
      }
    }
  }, [camadas, periodoCadUnico, dados, carregando, bboxAtual, erros, carregarCamada])

  const combinedTwoLayers = camadas.length === 2
    ? (() => {
        const [idA, idB] = camadas
        const keyA = getLayerKey(idA, periodoCadUnico)
        const keyB = getLayerKey(idB, periodoCadUnico)
        const dadosA = dados[keyA]
        const dadosB = dados[keyB]
        if (!dadosA || !dadosB) return null
        return combineTwoLayers(idA, idB, dadosA, dadosB)
      })()
    : null

  const estaCarregando = Object.values(carregando).some(Boolean)
  const camadasComErro = Object.entries(erros).filter(([, v]) => v).map(([k]) => k)
  const resumoCamadas = camadas.filter(Boolean).slice(0, 3)
  const textoResumo = resumoCamadas.length
    ? resumoCamadas.map((id) => CAMADAS_DISPONIVEIS[id]?.label || id).join(" • ")
    : "Sem camadas ativas"

  return (
    // Sem border/shadow próprios: quem enquadra o mapa agora é o card do DashboardPage
    // (evita a borda dupla). Aqui só cuidamos do recorte dos cantos e do fundo de espera.
    <div className="relative z-0 h-full w-full overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(242,248,255,0.9))]">
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex max-w-[22rem] items-start gap-2 rounded-xl border border-border/70 bg-background/85 px-3 py-2.5 shadow-sm backdrop-blur">
        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">mapa</p>
          <p className="text-sm font-medium text-foreground">
            {camadas.filter(Boolean).length > 0
              ? `${camadas.filter(Boolean).length} camada${camadas.filter(Boolean).length > 1 ? "s" : ""} ativa${camadas.filter(Boolean).length > 1 ? "s" : ""}`
              : "Sem camadas ativas"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{textoResumo}</p>
        </div>
      </div>

      {/* Toast de carregamento — flutuante, aparece enquanto GeoJSON carrega */}
      {estaCarregando && (
        <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm shadow-sm backdrop-blur">
          Carregando camadas...
        </div>
      )}

      {camadasComErro.length > 0 && erroVisivel && (
        <div className="absolute left-1/2 top-14 z-[1000] flex max-w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 items-start gap-2 rounded-2xl border border-red-200 bg-red-500/95 px-4 py-3 text-sm text-white shadow-lg backdrop-blur">
          <div className="flex-1">
            <p className="font-medium">Erro ao carregar camada</p>
            <p className="mt-1 text-xs text-red-50/90">
              {camadasComErro.join(", ")} — veja o console (F12)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setErroVisivel(false)}
            className="rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Fechar aviso de erro"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legenda do CadÚnico — aparece quando a camada está ativa */}
      {camadas.includes("cadunico") && <LegendaCadUnico />}

      {/* Legenda da variável de setor censitário — aparece quando uma variável
          está sendo usada para colorir os setores e já temos estatísticas dela */}
      {camadaSetorAtiva && variavelSetorSelecionada && estatisticasVariavelSetor && (
        <LegendaVariavelSetor codigo={variavelSetorSelecionada} stats={estatisticasVariavelSetor} cores={coresPaleta} />
      )}

      {/* Mapa Leaflet com camadas GeoJSON ativas */}
      <MapContainer
        center={[-30.05, -51.15]}
        zoom={12}
        className="relative z-0 h-full w-full rounded-[inherit] border-0 outline-none"
        zoomControl={false}
      >
        <MapResizeHandler trigger={sidebarAberto ?? true} />
          <ViewportBboxHandler
            ativo={camadas.some((id) => CAMADAS_COM_BBOX.has(id) || SETOR_LAYER_IDS.has(id))}
            onBboxChange={setBboxAtual}
          />
          <ForcarRedesenhoAoAtualizar gatilho={JSON.stringify(versoes)} />
        <ZoomControl />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {combinedTwoLayers ? (
          <GeoJSON
            key={`combined:${camadas.join(",")}:${bboxAtual ?? ""}`}
            data={combinedTwoLayers.combined}
            style={(feature) => estiloCamada(combinedTwoLayers.primaryId, opacidade, feature)}
            pointToLayer={
              CAMADAS_DISPONIVEIS[combinedTwoLayers.primaryId]?.geometry === "ponto"
                ? getPointToLayer(combinedTwoLayers.primaryId)
                : undefined
            }
            onEachFeature={(feature, layer) => {
              const tooltip = buildFeatureTooltip(combinedTwoLayers.primaryId, feature)
              if (tooltip) {
                layer.bindTooltip(tooltip)
              }
            }}
          />
        ) : (
          // Visualização separada das camadas
          camadas.map((id) => {
            const key = id === "cadunico" ? `${id}:${periodoCadUnico}` : id
            const keySetorVariavelLocal = SETOR_LAYER_IDS.has(id) && variavelSetorSelecionada
              ? `${getLayerKey(id, periodoCadUnico)}:variavel:${variavelSetorSelecionada}:${bboxAtual ?? "full"}`
              : null
            const dadosParaRenderizar = keySetorVariavelLocal ? dados[keySetorVariavelLocal] ?? dados[key] : dados[key]
            // Para camadas com bbox, a key inclui a versão (incrementada a cada
            // merge de dados novos) para forçar o remount da layer no Leaflet.
            const versionKey = keySetorVariavelLocal ?? key
            const reactKey = CAMADAS_COM_BBOX.has(id) || keySetorVariavelLocal ? `${versionKey}:v${versoes[versionKey] ?? 0}` : key
            return dadosParaRenderizar ? (
              <GeoJSON
                key={reactKey}
                data={dadosParaRenderizar}
                style={(feature) =>
                  keySetorVariavelLocal
                    ? estiloSetorComVariavel(feature ?? {}, opacidade, maxValorVariavelSetor, coresPaleta)
                    : estiloCamada(id, opacidade, feature)
                }
                pointToLayer={getPointToLayer(id)}
                onEachFeature={(feature, layer) => {
                  const tooltip = buildFeatureTooltip(id, feature, variavelSetorSelecionada)
                  if (tooltip) {
                    layer.bindTooltip(tooltip)
                  }
                }}
              />
            ) : null
          })
        )}
      </MapContainer>

    </div>
  )
}