import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { DashboardMap } from "./map/DashboardMap"
import { LayerMenu } from "./components/LayerMenu"
import { obterPeriodosCadUnico } from "@/services/dataService"
import { CONFIG, type ViewKey } from "./dashboardConfig"

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const view = (searchParams.get("view") ?? "clima") as ViewKey
  const config = CONFIG[view] ?? CONFIG.clima

  const periodosCadUnico = useMemo(() => obterPeriodosCadUnico(), [])

  const [slots, setSlots] = useState<string[]>([...config.camadasIniciais])
  const [opacidadeCamadas, setOpacidadeCamadas] = useState(0.5)
  const [periodoCadUnico, setPeriodoCadUnico] = useState(
    () => periodosCadUnico[0].id
  )

  function setSlot(slot: number, id: string) {
    setSlots((ant) => {
      const novo = [...ant]
      novo[slot] = id
      return novo
    })
  }

  function limparSlot(slot: number) {
    setSlots((ant) => {
      const novo = [...ant]
      novo[slot] = ""
      return novo
    })
  }

  return (
    <div className="flex h-svh flex-col">

      {/* Cabeçalho da página — título da view ativa (clima, vulnerabilidade, desastres) */}
      <header className="flex items-center gap-4 z-[1000] border-b px-6 py-3">
      </header>

      {/* Área de trabalho — mapa ocupa o espaço restante, menu flutua sobre ele */}
      <main className="relative flex-1 isolate">
        <DashboardMap
          camadas={slots.filter(Boolean)}
          opacidade={opacidadeCamadas}
          periodoCadUnico={periodoCadUnico}
        />
        <LayerMenu
          slots={slots}
          onSetSlot={setSlot}
          onLimparSlot={limparSlot}
          opacidade={opacidadeCamadas}
          onOpacityChange={setOpacidadeCamadas}
          periodoCadUnico={periodoCadUnico}
          periodosCadUnico={periodosCadUnico}
          onPeriodoCadUnicoChange={setPeriodoCadUnico}
        />
      </main>

    </div>
  )
}

export default DashboardPage