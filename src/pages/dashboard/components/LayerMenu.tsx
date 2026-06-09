import { useMemo } from "react"
import { CAMADAS_DISPONIVEIS, BASE_LAYER_IDS } from "@/services/dataService"
import type { CadUnicoPeriodo } from "@/services/dataService"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface LayerMenuProps {
  slots: string[] // array limitada em até 3 ids, ex: ["municipios", "bacias", ""]
  onSetSlot: (slot: number, id: string) => void
  onLimparSlot: (slot: number) => void
  opacidade: number
  onOpacityChange: (value: number) => void
  periodoCadUnico: string
  periodosCadUnico: CadUnicoPeriodo[]
  onPeriodoCadUnicoChange: (periodo: string) => void
}

// Subcomponentes
/** Slider de transparência global das camadas */
function OpacitySlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <Slider
      label="Transparência"
      valueLabel={`${Math.round(value * 100)}%`}
      min={0.2}
      max={1}
      step={0.05}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      containerClassName="mb-4 rounded-xl border border-border bg-card p-3"
    />
  )
}

/** Seletor de período temporal para a camada CadÚnico */
function CadUnicoPeriodSelector({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string
  options: CadUnicoPeriodo[]
  onChange: (v: string) => void
  disabled: boolean
}) {
  return (
    <Select
      label="Período CadÚnico"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      containerClassName="mb-4 rounded-xl border border-border bg-card p-3"
    >
      {options.map((periodo) => (
        <option key={periodo.id} value={periodo.id}>
          {periodo.label}
        </option>
      ))}
    </Select>
  )
}

/** 3 selects de camada — slot 0 só mostra bases, slots 1-2 mostram as demais */
function LayerSelects({
  slots,
  onSet,
  onLimpar,
}: {
  slots: string[]
  onSet: (slot: number, id: string) => void
  onLimpar: (slot: number) => void
}) {
  const todasCamadas = useMemo(
    () => Object.values(CAMADAS_DISPONIVEIS),
    []
  )

  const camadasBase = useMemo(
    () => todasCamadas.filter((c) => BASE_LAYER_IDS.includes(c.id as any)),
    [todasCamadas]
  )
  const camadasTematicas = useMemo(
    () => todasCamadas.filter((c) => !BASE_LAYER_IDS.includes(c.id as any)),
    [todasCamadas]
  )

  return (
    <div className="mb-4 flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Camadas
      </p>
      {[0, 1, 2].map((slot) => {
        const valorAtual = slots[slot] ?? ""
        const outrosSlots = slots.filter((_, i) => i !== slot)

        // Slot 0 → só bases; slots 1-2 → só temáticas
        const pool = slot === 0 ? camadasBase : camadasTematicas
        const opcoesFiltradas = pool.filter((c) => !outrosSlots.includes(c.id))

        const corAtual = valorAtual
          ? ((CAMADAS_DISPONIVEIS[valorAtual]?.estilo as any)?.color ?? "#94a3b8")
          : "#e2e8f0"

        return (
          <div key={slot} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full transition-colors"
              style={{ backgroundColor: corAtual }}
            />
            <Select
              value={valorAtual}
              onChange={(e) => {
                if (e.target.value === "") onLimpar(slot)
                else onSet(slot, e.target.value)
              }}
              className="flex-1"
            >
              <option value="">— nenhuma —</option>
              {opcoesFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        )
      })}
    </div>
  )
}

// Componente principal do menu lateral de camadas 
export function LayerMenu({
  slots,
  onSetSlot,
  onLimparSlot,
  opacidade,
  onOpacityChange,
  periodoCadUnico,
  periodosCadUnico,
  onPeriodoCadUnicoChange,
}: LayerMenuProps) {
  const cadunicoAtivo = slots.includes("cadunico")

  return (
    <aside className="absolute bottom-8 right-4 z-[1000] w-72 rounded-xl border bg-background/95 p-3 shadow-md backdrop-blur">

      {/* 1. Seleção de camadas — 3 slots */}
      <section aria-label="Camadas">
        <LayerSelects
          slots={slots}
          onSet={onSetSlot}
          onLimpar={onLimparSlot}
        />
      </section>

      {/* 2. Controle de opacidade global */}
      <section aria-label="Opacidade das camadas">
        <OpacitySlider value={opacidade} onChange={onOpacityChange} />
      </section>

      {/* 3. Seleção de período para a camada CadÚnico */}
      {cadunicoAtivo && (
        <section aria-label="Período CadÚnico">
          <CadUnicoPeriodSelector
            value={periodoCadUnico}
            options={periodosCadUnico}
            onChange={onPeriodoCadUnicoChange}
            disabled={false}
          />
        </section>
      )}

    </aside>
  )
}