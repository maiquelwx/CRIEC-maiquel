import { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import { useMap } from "react-leaflet"
import type { FeatureCollection } from "geojson"
import { fetchCamada, CAMADAS_DISPONIVEIS } from "@/services/dataService"
import {
  getLayerKey,
  buildCadUnicoMap,
  combineMunicipiosWithCadUnico,
  combineBaciasWithCadUnico,
  combineTwoLayers,
} from "./mapHelpers"
import { estiloCamada } from "./styleHelpers"
import L from "leaflet"

interface DashboardMapProps {
  camadas: string[]
  opacidade: number
  periodoCadUnico: string
}

// Legenda para CadÚnico
const LegendaCadUnico = () => (
  <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-background/90 p-3 shadow-md backdrop-blur">
    <div className="text-xs font-semibold text-muted-foreground mb-2">Faixa de Renda</div>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded" style={{ backgroundColor: "#f3f4f6" }}></div>
        <span className="text-xs">Sem dados</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded" style={{ backgroundColor: "#10b981" }}></div>
        <span className="text-xs">Baixa (&lt; 15%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
        <span className="text-xs">Média (15-25%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded" style={{ backgroundColor: "#ef4444" }}></div>
        <span className="text-xs">Alta (&gt; 25%)</span>
      </div>
    </div>
  </div>
)

export function DashboardMap({ camadas, opacidade, periodoCadUnico }: DashboardMapProps) {

  const [dados, setDados] = useState<Record<string, FeatureCollection>>({})
  const [carregando, setCarregando] = useState<Record<string, boolean>>({})
  const [erros, setErros] = useState<Record<string, boolean>>({})

  function carregarCamada(id: string, key: string) {
    setCarregando((ant) => ({ ...ant, [key]: true }))
    fetchCamada(id, periodoCadUnico)
      .then((json) => {
        setDados((ant) => ({ ...ant, [key]: json }))
      })
      .catch((err) => {
        console.error(`Erro ao carregar camada "${id}" (key="${key}"):`, err)
        setErros((ant) => ({ ...ant, [key]: true }))
      })
      .finally(() => {
        setCarregando((ant) => ({ ...ant, [key]: false }))
      })
  }

  const getPointToLayer = (id: string) => {
    const config = CAMADAS_DISPONIVEIS[id]
    if (config?.geometry !== "ponto") return undefined

    return (feature: any, latlng: L.LatLng) =>
      L.circleMarker(latlng, estiloCamada(id, opacidade, feature))
  }

  const formatTooltipValue = (value: any) => {
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

  const buildFeatureTooltip = (id: string, feature: any) => {
    const props = feature?.properties
    if (!props || typeof props !== "object") return undefined

    const primaryLabel =
      props.Municipio || props.NM_MUN || props.Nome || props.nome || props.name || props.regiao || props.localidade || props.LOCALIDADE
    const config = CAMADAS_DISPONIVEIS[id]
    const layerName = config?.label || id

    const lines: string[] = [`<b>${primaryLabel || layerName}</b>`]

    if (id === "cadunico") {
      const populacao = props.Populacao
      const faixa1 = props.Faixa_1
      const taxaFaixa1 = props.Taxa_Faixa_1
      const faixa1e2 = props.Faixa_1_e_2
      const taxaFaixa1e2 = props.Taxa_Faixa_1_e_2

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

    const entries = Object.entries(props)
      .filter(([key]) => key !== "geometry" && key !== "type")
      .sort(([a], [b]) => {
        const aIndex = specialPropertyKeys.indexOf(a.toLowerCase())
        const bIndex = specialPropertyKeys.indexOf(b.toLowerCase())
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      .slice(0, 8)

    entries.forEach(([key, value]) => {
      if (key === "Municipio" || key === "NM_MUN" || key === "Nome" || key === "nome" || key === "name" || key === "regiao" || key === "localidade" || key === "LOCALIDADE") {
        return
      }
      if (value === null || value === undefined || value === "") return
      lines.push(`${normalizeTooltipKey(key)}: ${formatTooltipValue(value)}`)
    })

    return lines.length > 1 ? lines.join("<br/>") : undefined
  }

  useEffect(() => {
    camadas.forEach((id) => {
      const key = getLayerKey(id, periodoCadUnico)
      if (dados[key] || carregando[key] || erros[key]) return
      carregarCamada(id, key)
    })

    if (camadas.includes("bacias") && camadas.includes("cadunico") && !dados["municipios"] && !carregando["municipios"] && !erros["municipios"]) {
      carregarCamada("municipios", "municipios")
    }

    if (camadas.includes("municipios") && camadas.includes("cadunico")) {
      const keyMunicipios = "municipios"
      const keyCadUnico = getLayerKey("cadunico", periodoCadUnico)
      const keyCombinado = `combinado:${periodoCadUnico}`

      if (dados[keyMunicipios] && dados[keyCadUnico] && !dados[keyCombinado] && !carregando[keyCombinado]) {
        setCarregando((ant) => ({ ...ant, [keyCombinado]: true }))
        const municipios = dados[keyMunicipios] as FeatureCollection
        const cadunico = dados[keyCadUnico] as FeatureCollection
        const combinado = combineMunicipiosWithCadUnico(municipios, buildCadUnicoMap(cadunico))

        setDados((ant) => ({ ...ant, [keyCombinado]: combinado }))
        setCarregando((ant) => ({ ...ant, [keyCombinado]: false }))
      }
    }

    if (camadas.includes("bacias") && camadas.includes("cadunico")) {
      const keyBacias = "bacias"
      const keyMunicipios = "municipios"
      const keyCadUnico = getLayerKey("cadunico", periodoCadUnico)
      const keyCombinado = `bacias_combinado:${periodoCadUnico}`

      if (dados[keyBacias] && dados[keyMunicipios] && dados[keyCadUnico] && !dados[keyCombinado] && !carregando[keyCombinado]) {
        setCarregando((ant) => ({ ...ant, [keyCombinado]: true }))

        const bacias = dados[keyBacias] as FeatureCollection
        const municipios = dados[keyMunicipios] as FeatureCollection
        const cadunico = dados[keyCadUnico] as FeatureCollection
        const combinado = combineBaciasWithCadUnico(bacias, municipios, cadunico)

        setDados((ant) => ({ ...ant, [keyCombinado]: combinado }))
        setCarregando((ant) => ({ ...ant, [keyCombinado]: false }))
      }
    }
  }, [camadas, periodoCadUnico, dados, carregando])

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

  const estaCarregando = Object.values(carregando).some(Boolean)
  const camadasComErro = Object.entries(erros).filter(([, v]) => v).map(([k]) => k)
  return (
    <div className="relative h-full w-full">

      {/* Toast de carregamento — flutuante, aparece enquanto GeoJSON carrega */}
      {estaCarregando && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-sm shadow-md">
          Carregando camadas...
        </div>
      )}
      
      
      {camadasComErro.length > 0 && (
        <div className="absolute top-14 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-red-500/90 px-4 py-2 text-sm text-white shadow-md">
          Erro ao carregar: {camadasComErro.join(", ")} — veja o console (F12)
        </div>
      )}

      {/* Legenda do CadÚnico — aparece quando a camada está ativa */}
      {camadas.includes("cadunico") && <LegendaCadUnico />}

      {/* Mapa Leaflet com camadas GeoJSON ativas */}
      <MapContainer
        center={[-30.0, -51.0]}
        zoom={7}
        className="h-full w-full border-0 outline-none"
        zoomControl={false}
      >
        <ZoomControl />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {combinedTwoLayers ? (
          <GeoJSON
            key={`combined:${camadas.join(",")}`}
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
            return dados[key] ? (
              <GeoJSON
                key={key}
                data={dados[key]}
                style={(feature) => estiloCamada(id, opacidade, feature)}
                pointToLayer={getPointToLayer(id)}
                onEachFeature={(feature, layer) => {
                  const tooltip = buildFeatureTooltip(id, feature)
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