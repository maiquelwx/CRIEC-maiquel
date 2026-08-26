import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { DashboardMap } from "./map/DashboardMap"
import { LayerMenu } from "./components/LayerMenu"
import { obterPeriodosCadUnico } from "@/services/dataService"
import { CONFIG, type ViewKey } from "./dashboardConfig"
import type { EstatisticasVariavel } from "./map/mapHelpers"
import type { PaletaVariavelKey } from "./map/styleHelpers"

function CollapseIcon({ aberto }: { aberto: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform ${aberto ? "rotate-180" : ""}`}
      fill="none"
    >
      <path d="M7.5 2.5L3.5 6L7.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DashboardPage() {
  const [estatisticasVariavelSetor, setEstatisticasVariavelSetor] = useState<EstatisticasVariavel | null>(null)
  const [paletaVariavel, setPaletaVariavel] = useState<PaletaVariavelKey>("vermelho")

  const [searchParams] = useSearchParams()
  const view = (searchParams.get("view") ?? "clima") as ViewKey
  const config = CONFIG[view] ?? CONFIG.clima

  const periodosCadUnico = useMemo(() => obterPeriodosCadUnico(), [])

  const [slots, setSlots] = useState<string[]>([...config.camadasIniciais])
  const [opacidadeCamadas, setOpacidadeCamadas] = useState(0.5)
  const [variavelSetorSelecionada, setVariavelSetorSelecionada] = useState<string | undefined>(undefined)
  const [periodoCadUnico, setPeriodoCadUnico] = useState(
    () => periodosCadUnico[0].id
  )
  // Controla se o catálogo de camadas está docked visível ou recolhido
  const [sidebarAberto, setSidebarAberto] = useState(true)

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
    // h-full (não h-svh): o Layout pai já reserva o espaço da navbar global e entrega
    // aqui só a altura restante da viewport. Se usarmos h-svh de novo, duplicamos altura
    // (navbar + h-svh > 100vh), o navegador passa a rolar a PÁGINA inteira, e é esse
    // scroll de página que reintroduz o bug de sobreposição com a navbar.
    <div className="relative isolate flex h-full flex-col overflow-hidden bg-muted/40">

      {/* Cabeçalho da página — título da view ativa (clima, vulnerabilidade, desastres).
          Sem sticky/z-index: ele não compete com a navbar global, só ocupa seu espaço
          normal no fluxo. Como o container pai já está com overflow-hidden e altura
          travada, nada aqui dentro precisa "grudar" no topo — não há scroll de página. */}
      <header className="relative z-[1200] flex flex-shrink-0 items-center justify-between border-b bg-background px-6 py-3">
      </header>

      {/* Área de trabalho — mapa contido em um card, catálogo de camadas docked à direita */}
      <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
        <main className="relative z-0 min-w-0 flex-1 overflow-hidden p-4">
          <div className="relative z-0 h-full min-h-[560px] w-full overflow-hidden rounded-xl border border-border shadow-sm">
            <DashboardMap
              camadas={slots.filter(Boolean)}
              opacidade={opacidadeCamadas}
              periodoCadUnico={periodoCadUnico}
              variavelSetorSelecionada={variavelSetorSelecionada}
              sidebarAberto={sidebarAberto}
              onVariavelStatsChange={setEstatisticasVariavelSetor}
              paletaVariavel={paletaVariavel}
            />
          </div>

          {/* Botão para recolher/expandir o catálogo, ancorado na borda do mapa */}
          <button
            type="button"
            onClick={() => setSidebarAberto((a) => !a)}
            aria-label={sidebarAberto ? "Recolher catálogo de camadas" : "Expandir catálogo de camadas"}
            className="absolute right-4 top-1/2 z-[1000] flex h-8 w-6 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background shadow-sm transition hover:bg-muted"
          >
            <CollapseIcon aberto={sidebarAberto} />
          </button>
        </main>

        <aside
          className={`flex h-full flex-shrink-0 overflow-hidden border-l border-border bg-background transition-[width] duration-200 ${
            sidebarAberto ? "w-80" : "w-0 border-l-0"
          }`}
        >
          {/* Largura fixa interna: evita que o conteúdo "encolha" durante a transição de recolher */}
          <div className="h-full w-80">
            <LayerMenu
              slots={slots}
              onSetSlot={setSlot}
              onLimparSlot={limparSlot}
              opacidade={opacidadeCamadas}
              onOpacityChange={setOpacidadeCamadas}
              periodoCadUnico={periodoCadUnico}
              periodosCadUnico={periodosCadUnico}
              onPeriodoCadUnicoChange={setPeriodoCadUnico}
              variavelSetorSelecionada={variavelSetorSelecionada}
              onVariavelSetorChange={setVariavelSetorSelecionada}
              estatisticasVariavelSetor={estatisticasVariavelSetor}
              ordemVariaveisSetor={config.ordemVariaveisSetor}
              labelSugeridas={config.labelSugeridas}
              paletaVariavel={paletaVariavel}
              onPaletaVariavelChange={setPaletaVariavel}
            />
          </div>
        </aside>
      </div>

    </div>
  )
}

export default DashboardPage