import { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import { useMap } from "react-leaflet"
import type { FeatureCollection } from "geojson"
import { fetchCamada } from "@/services/dataService"
import {
  getLayerKey,
  buildCadUnicoMap,
  combineMunicipiosWithCadUnico,
  combineBaciasWithCadUnico,
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
  const [renderKey, setRenderKey] = useState(0)

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
        setRenderKey((k) => k + 1)
        setCarregando((ant) => ({ ...ant, [keyCombinado]: false }))
      }
    }
  }, [camadas, periodoCadUnico, dados, carregando])


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

        {camadas.includes("municipios") && camadas.includes("cadunico") ? (
          // Visualização combinada municípios + cadunico
          (() => {
            const keyCombinado = `combinado:${periodoCadUnico}`
            return dados[keyCombinado] ? (
              <GeoJSON
                key={keyCombinado}
                data={dados[keyCombinado]}
                style={(feature) => estiloCamada("cadunico", opacidade, feature)}
                onEachFeature={(feature, layer) => {
                  if (feature.properties) {
                    const props = feature.properties
                    const municipioNome = props.NM_MUN || props.Municipio
                    const populacao = props.Populacao
                    const faixa1 = props.Faixa_1
                    const taxaFaixa1 = props.Taxa_Faixa_1
                    const faixa1e2 = props.Faixa_1_e_2
                    const taxaFaixa1e2 = props.Taxa_Faixa_1_e_2

                    let tooltip = `<b>${municipioNome}</b>`

                    if (populacao !== undefined) {
                      tooltip += `<br/>População: ${populacao.toLocaleString()}`
                    }

                    if (faixa1 !== undefined && taxaFaixa1 !== undefined) {
                      tooltip += `<br/>Faixa 1: ${faixa1} (${taxaFaixa1.toFixed(1)}%)`
                    }

                    if (faixa1e2 !== undefined && taxaFaixa1e2 !== undefined) {
                      tooltip += `<br/>Faixa 1+2: ${faixa1e2} (${taxaFaixa1e2.toFixed(1)}%)`
                    } else {
                      tooltip += `<br/><i>Sem dados do CadÚnico</i>`
                    }

                    layer.bindTooltip(tooltip)
                  }
                }}
              />
            ) : null
          })()
        ) : camadas.includes("bacias") && camadas.includes("cadunico") ? (
          // Visualização combinada bacias + cadunico
          (() => {
            const keyCombinado = `bacias_combinado:${periodoCadUnico}`
            return dados[keyCombinado] ? (
              <GeoJSON
                key={`${keyCombinado}-${renderKey}`}
                data={dados[keyCombinado]}
                style={(feature) => estiloCamada("bacias_combinado", opacidade, feature)}
                onEachFeature={(feature, layer) => {
                  // Forçar aplicação do estilo após renderização
                  (layer as L.Path).setStyle(estiloCamada("bacias_combinado", opacidade, feature))
                  
                  if (feature.properties) {
                    const props = feature.properties
                    const tooltip = `
                      <b>Bacia ${props.regiao}</b><br/>
                      Municípios: ${props.municipios || 0}<br/>
                      População total: ${(props.populacaoTotal || 0).toLocaleString()}<br/>
                      Taxa média pobreza: ${(props.taxaMediaFaixa1e2 || 0).toFixed(1)}%<br/>
                      Famílias Faixa 1+2: ${props.faixa1e2Total || 0}
                    `
                    layer.bindTooltip(tooltip)
                  }
                }}
              />
            ) : null
          })()
        ) : (
          // Visualização separada das camadas
          camadas.map((id) => {
            const key = id === "cadunico" ? `${id}:${periodoCadUnico}` : id
            return dados[key] ? (
              <GeoJSON
                key={key}
                data={dados[key]}
                style={(feature) => estiloCamada(id, opacidade, feature)}
                pointToLayer={(feature, latlng) => {
                  // Renderiza pontos como círculos (estilizáveis via style())
                  return L.circleMarker(latlng, {
                    radius: 3,
                    ...estiloCamada(id, opacidade, feature),
                  })
                }}
                onEachFeature={id === "cadunico" ? (feature, layer) => {
                  if (feature.properties) {
                    const props = feature.properties
                    const tooltip = `
                      <b>${props.Municipio}</b><br/>
                      População: ${props.Populacao?.toLocaleString()}<br/>
                      Faixa 1: ${props.Faixa_1} (${props.Taxa_Faixa_1?.toFixed(1)}%)<br/>
                      Faixa 1+2: ${props.Faixa_1_e_2} (${props.Taxa_Faixa_1_e_2?.toFixed(1)}%)
                    `
                    layer.bindTooltip(tooltip)
                  }
                } : undefined}
              />
            ) : null
          })
        )}
      </MapContainer>

    </div>
  )
}