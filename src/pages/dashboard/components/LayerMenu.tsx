import { useEffect, useMemo, useRef, useState } from "react"
import {
  CAMADAS_DISPONIVEIS,
  BASE_LAYER_IDS,
  GRUPOS_CAMADAS,
  fetchVariaveis,
} from "@/services/dataService"
import type { CadUnicoPeriodo, CamadaConfig, VariavelCatalogo } from "@/services/dataService"
import type { EstatisticasVariavel } from "../map/mapHelpers"
import { PALETAS_VARIAVEL, corRampaSequencial, type PaletaVariavelKey } from "../map/styleHelpers"
import { Slider } from "@/components/ui/slider"

interface LayerMenuProps {
  slots: string[]
  onSetSlot: (slot: number, id: string) => void
  onLimparSlot: (slot: number) => void
  opacidade: number
  onOpacityChange: (value: number) => void
  periodoCadUnico: string
  periodosCadUnico: CadUnicoPeriodo[]
  onPeriodoCadUnicoChange: (periodo: string) => void
  variavelSetorSelecionada?: string
  onVariavelSetorChange: (codigo: string | undefined) => void
  estatisticasVariavelSetor?: EstatisticasVariavel | null
  ordemVariaveisSetor?: readonly string[]
  labelSugeridas?: string
  paletaVariavel?: PaletaVariavelKey
  onPaletaVariavelChange?: (paleta: PaletaVariavelKey) => void
}

// ---------------------------------------------------------------------------
// Favoritos e recentes: persistidos em localStorage para sobreviver a reloads.
// Falha silenciosamente em ambientes sem storage (modo privado, quota etc.) —
// a UI continua funcionando, só não lembra a escolha entre sessões.
// ---------------------------------------------------------------------------

const FAVORITOS_STORAGE_KEY = "criec:camadas-favoritas"
const VARIAVEIS_FAVORITAS_STORAGE_KEY = "criec:variaveis-favoritas"
const VARIAVEIS_RECENTES_STORAGE_KEY = "criec:variaveis-recentes"
const MAX_VARIAVEIS_RECENTES = 6

function carregarFavoritos(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const bruto = window.localStorage.getItem(FAVORITOS_STORAGE_KEY)
    return bruto ? new Set(JSON.parse(bruto)) : new Set()
  } catch {
    return new Set()
  }
}

function salvarFavoritos(favoritos: Set<string>) {
  try {
    window.localStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(Array.from(favoritos)))
  } catch {
    // sem storage disponível — segue sem persistir
  }
}

function carregarFavoritosVariaveis(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const bruto = window.localStorage.getItem(VARIAVEIS_FAVORITAS_STORAGE_KEY)
    return bruto ? new Set(JSON.parse(bruto)) : new Set()
  } catch {
    return new Set()
  }
}

function salvarFavoritosVariaveis(favoritos: Set<string>) {
  try {
    window.localStorage.setItem(VARIAVEIS_FAVORITAS_STORAGE_KEY, JSON.stringify(Array.from(favoritos)))
  } catch {
    // sem storage disponível — segue sem persistir
  }
}

function carregarRecentesVariaveis(): string[] {
  if (typeof window === "undefined") return []
  try {
    const bruto = window.localStorage.getItem(VARIAVEIS_RECENTES_STORAGE_KEY)
    return bruto ? (JSON.parse(bruto) as string[]) : []
  } catch {
    return []
  }
}

function salvarRecentesVariaveis(recentes: string[]) {
  try {
    window.localStorage.setItem(VARIAVEIS_RECENTES_STORAGE_KEY, JSON.stringify(recentes))
  } catch {
    // sem storage disponível — segue sem persistir
  }
}

type EstiloCamadaComCor = {
  color?: string
}

function obterCorCamada(estilo: CamadaConfig["estilo"]) {
  return (estilo as EstiloCamadaComCor | undefined)?.color ?? "#94a3b8"
}

// --- Ícones -----------------------------------------------------------------

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 17L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon({ preenchida }: { preenchida: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={preenchida ? "currentColor" : "none"} className="h-3.5 w-3.5">
      <path
        d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.9" fill="currentColor" />
    </svg>
  )
}

function GeometryIcon({ geometry }: { geometry?: CamadaConfig["geometry"] }) {
  if (geometry === "ponto") {
    return (
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
        <circle cx="6" cy="6" r="4" fill="currentColor" />
      </svg>
    )
  }
  if (geometry === "linha") {
    return (
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
        <path d="M1 9L11 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M10 2.5L2.5 6.5 10 10.5 17.5 6.5 10 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2.5 10.5L10 14.5 17.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2.5 14.5L10 18.5 17.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

// --- Catálogo priorizado de variáveis do setor censitário -------------------
// (curadoria manual: variáveis mais relevantes para análise de vulnerabilidade
// aparecem primeiro, antes do restante do catálogo trazido pela API)

const VARIAVEIS_SETOR_PRIORIZADAS: VariavelCatalogo[] = [
  {
    id: 1,
    codigo: "V0007",
    nome: "Total de Domicílios Particulares Ocupados",
    descricao: "Base para calcular densidade domiciliar por setor - exposição estrutural",
    unidade: null,
  },
  {
    id: 2,
    codigo: "V01006",
    nome: "Quantidade de moradores",
    descricao: "População total exposta por setor - insumo para qualquer mapa de risco populacional",
    unidade: null,
  },
  {
    id: 3,
    codigo: "V01041",
    nome: "70 anos ou mais",
    descricao: "Grupo etário mais vulnerável em eventos extremos (mobilidade reduzida, mortalidade em ondas de calor/enchente)",
    unidade: null,
  },
  {
    id: 4,
    codigo: "V01040",
    nome: "60 a 69 anos",
    descricao: "Complementa o grupo idoso - vulnerabilidade crescente",
    unidade: null,
  },
  {
    id: 5,
    codigo: "V01031",
    nome: "0 a 4 anos",
    descricao: "Crianças pequenas - alta vulnerabilidade em desastres (dependência, risco sanitário)",
    unidade: null,
  },
  {
    id: 6,
    codigo: "V00201",
    nome: "Água não chega encanada ao domicílio",
    descricao: "Ausência de infraestrutura básica - indicador direto de vulnerabilidade e risco sanitário pós-desastre",
    unidade: null,
  },
  {
    id: 7,
    codigo: "V00309",
    nome: "Esgoto: rede geral ou pluvial",
    descricao: "Proxy de saneamento adequado - setores sem isso têm risco elevado de contaminação em enchentes",
    unidade: null,
  },
  {
    id: 8,
    codigo: "V00312",
    nome: "Esgoto: fossa rudimentar ou buraco",
    descricao: "Saneamento precário - forte indicador de risco de doenças de veiculação hídrica",
    unidade: null,
  },
  {
    id: 9,
    codigo: "V00401",
    nome: "Lixo jogado em terreno baldio, encosta ou área pública",
    descricao: "Risco de obstrução de bueiros/drenagem urbana (fator de agravamento de enchentes) e risco de deslizamento em encostas",
    unidade: null,
  },
  {
    id: 10,
    codigo: "V06004",
    nome: "Rendimento nominal médio mensal do responsável",
    descricao: "Proxy socioeconômico - capacidade de resposta/recuperação pós-desastre (renda baixa = menor resiliência)",
    unidade: null,
  },
]

const CODIGOS_VARIAVEIS_PRIORIZADAS = new Set(VARIAVEIS_SETOR_PRIORIZADAS.map((item) => item.codigo))

// Agrupamento temático por prefixo de código IBGE — ajuda quem já conhece a
// nomenclatura V00xxx/V01xxx/V06xxx a filtrar rapidamente por domínio.
const DOMINIOS_VARIAVEL = [
  { key: "domicilios", label: "Domicílios", teste: (codigo: string) => /^V000[1-7]$/.test(codigo) },
  { key: "populacao", label: "População e idade", teste: (codigo: string) => /^V01/.test(codigo) },
  { key: "saneamento", label: "Saneamento", teste: (codigo: string) => /^V00[2-4]/.test(codigo) },
  { key: "renda", label: "Renda", teste: (codigo: string) => /^V06/.test(codigo) },
] as const

// Cor de acento por domínio — usada no ponto do card, na faixa lateral do item
// selecionado e no chip de filtro, para reforçar visualmente o agrupamento
// mesmo quando a lista não está filtrada por domínio.
const CORES_DOMINIO: Record<string, string> = {
  domicilios: "#0ea5e9",
  populacao: "#8b5cf6",
  saneamento: "#06b6d4",
  renda: "#f59e0b",
  outras: "#64748b",
}

function obterDominioVariavel(codigo: string): string {
  return DOMINIOS_VARIAVEL.find((d) => d.teste(codigo))?.key ?? "outras"
}

function labelDominioVariavel(key: string) {
  return DOMINIOS_VARIAVEL.find((d) => d.key === key)?.label ?? "Outras"
}

function normalizarVariaveisSetor(variaveis: VariavelCatalogo[]) {
  const mapaPrioridade = new Map(VARIAVEIS_SETOR_PRIORIZADAS.map((item, indice) => [item.codigo, indice]))

  return [...variaveis]
    .map((variavel) => {
      const prioritaria = VARIAVEIS_SETOR_PRIORIZADAS.find((item) => item.codigo === variavel.codigo)
      return prioritaria ? { ...variavel, ...prioritaria } : variavel
    })
    .sort((a, b) => {
      const prioridadeA = mapaPrioridade.get(a.codigo)
      const prioridadeB = mapaPrioridade.get(b.codigo)

      if (prioridadeA !== undefined && prioridadeB !== undefined) return prioridadeA - prioridadeB
      if (prioridadeA !== undefined) return -1
      if (prioridadeB !== undefined) return 1
      return a.codigo.localeCompare(b.codigo)
    })
}

function ordenarPorPrioridade<T extends { codigo: string }>(itens: T[], ordem?: readonly string[]): T[] {
  if (!ordem || ordem.length === 0) return itens
  const mapaPrioridade = new Map(ordem.map((codigo, indice) => [codigo, indice]))
  return [...itens].sort((a, b) => {
    const prioridadeA = mapaPrioridade.get(a.codigo)
    const prioridadeB = mapaPrioridade.get(b.codigo)
    if (prioridadeA !== undefined && prioridadeB !== undefined) return prioridadeA - prioridadeB
    if (prioridadeA !== undefined) return -1
    if (prioridadeB !== undefined) return 1
    return 0
  })
}

// Classe utilitária para os chips de filtro (domínio, favoritas, etc.)
function classeChip(ativo: boolean) {
  return `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] transition ${
    ativo
      ? "border-primary/60 bg-primary/10 text-primary"
      : "border-border text-muted-foreground hover:border-primary/30"
  }`
}

// Formata valores de fronteira do histograma de forma compacta, para caber
// no espaço estreito de cada bin no "eixo x" (ex: 12000 -> "12k").
function formatarValorFaixa(valor: number): string {
  const arredondado = Math.round(valor)
  const abs = Math.abs(arredondado)
  if (abs >= 10000) return `${Math.round(arredondado / 1000)}k`
  if (abs >= 1000) return `${(arredondado / 1000).toFixed(1)}k`
  return String(arredondado)
}

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
      containerClassName="mb-0 rounded-lg border border-border bg-card p-3"
    />
  )
}

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
    <div className="rounded-lg border border-border bg-card p-3">
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Período CadÚnico
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
      >
        {options.map((periodo) => (
          <option key={periodo.id} value={periodo.id}>
            {periodo.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Tipos auxiliares para a lista de variáveis: "flat" quando há busca/filtro de
// domínio ativo (não faz sentido segmentar em prateleiras um resultado já
// filtrado), "secoes" no modo de navegação padrão (favoritas > recentes >
// sugeridas > catálogo completo).
type SecoesVariaveisFlat = { modo: "flat"; itens: VariavelCatalogo[] }
type SecoesVariaveisAgrupadas = {
  modo: "secoes"
  favoritas: VariavelCatalogo[]
  recentes: VariavelCatalogo[]
  sugeridas: VariavelCatalogo[]
  todas: VariavelCatalogo[]
}

function LayerSelects({
  slots,
  onSet,
  onLimpar,
  variavelSetorSelecionada,
  onVariavelSetorChange,
  estatisticasVariavelSetor,
  ordemVariaveisSetor,
  labelSugeridas,
  paletaVariavel,
  onPaletaVariavelChange,
}: {
  slots: string[]
  onSet: (slot: number, id: string) => void
  onLimpar: (slot: number) => void
  variavelSetorSelecionada?: string
  onVariavelSetorChange: (codigo: string | undefined) => void
  estatisticasVariavelSetor?: EstatisticasVariavel | null
  ordemVariaveisSetor?: readonly string[]
  labelSugeridas?: string
  paletaVariavel?: PaletaVariavelKey
  onPaletaVariavelChange?: (paleta: PaletaVariavelKey) => void
}) {
  const [slotAtivo, setSlotAtivo] = useState(0)
  // Aba de categoria ativa no seletor temático: chave de grupo, "favoritas" ou "todas"
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas")
  const [busca, setBusca] = useState("")
  const [favoritos, setFavoritos] = useState<Set<string>>(() => carregarFavoritos())

  const [dominioVariavel, setDominioVariavel] = useState<string | null>(null)
  const [buscaVariaveis, setBuscaVariaveis] = useState("")
  const [ordenacaoVariaveis, setOrdenacaoVariaveis] = useState<"padrao" | "alfabetica">("padrao")
  const [variavelExpandida, setVariavelExpandida] = useState<string | null>(null)
  const [favoritosVariaveis, setFavoritosVariaveis] = useState<Set<string>>(() => carregarFavoritosVariaveis())
  const [recentesVariaveis, setRecentesVariaveis] = useState<string[]>(() => carregarRecentesVariaveis())
  const [variaveisSetor, setVariaveisSetor] = useState<VariavelCatalogo[] | null>(null)
  const [erroVariaveis, setErroVariaveis] = useState<string | null>(null)

  const coresPaleta = paletaVariavel ? PALETAS_VARIAVEL[paletaVariavel].cores : PALETAS_VARIAVEL.vermelho.cores

  const camadasComVariaveis = new Set([
    "setores_censitarios_banco",
    "setores_censitarios",
    "setores_censitarios_local",
    "setores_censitarios_completo",
    "setores_censitarios_simplificado",
  ])

  const todasCamadas = useMemo(() => Object.values(CAMADAS_DISPONIVEIS), [])
  const camadasBase = useMemo(
    () => todasCamadas.filter((c) => BASE_LAYER_IDS.includes(c.id as (typeof BASE_LAYER_IDS)[number])),
    [todasCamadas]
  )
  const camadasTematicas = useMemo(
    () => todasCamadas.filter((c) => !BASE_LAYER_IDS.includes(c.id as (typeof BASE_LAYER_IDS)[number])),
    [todasCamadas]
  )

  function alternarFavorito(id: string) {
    setFavoritos((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      salvarFavoritos(novo)
      return novo
    })
  }

  function alternarFavoritoVariavel(codigo: string) {
    setFavoritosVariaveis((atual) => {
      const novo = new Set(atual)
      if (novo.has(codigo)) novo.delete(codigo)
      else novo.add(codigo)
      salvarFavoritosVariaveis(novo)
      return novo
    })
  }

  // Envolve onVariavelSetorChange para também registrar a variável no
  // histórico de recentes — só quando a escolha é explícita do usuário.
  // Clicar na variável já ativa desmarca (remove a intersecção do mapa).
  function selecionarVariavel(codigo: string) {
    if (variavelSetorSelecionada === codigo) {
      onVariavelSetorChange(undefined)
      return
    }

    onVariavelSetorChange(codigo)
    setRecentesVariaveis((atual) => {
      const novo = [codigo, ...atual.filter((c) => c !== codigo)].slice(0, MAX_VARIAVEIS_RECENTES)
      salvarRecentesVariaveis(novo)
      return novo
    })
  }

  const termoBusca = busca.trim().toLowerCase()
  const buscaAtiva = termoBusca.length > 0

  const gruposComConteudo = useMemo(() => {
    const chaves = new Set(camadasTematicas.map((c) => c.grupo ?? "outros"))
    return GRUPOS_CAMADAS.filter((g) => chaves.has(g.key))
  }, [camadasTematicas])

  const camadasFavoritas = useMemo(
    () => camadasTematicas.filter((c) => favoritos.has(c.id)),
    [camadasTematicas, favoritos]
  )

  // Fonte única de verdade para a grade de camadas exibida: busca (quando
  // ativa) ignora abas e varre todos os grupos; sem busca, respeita a aba.
  const camadasExibidas = useMemo(() => {
    const base = buscaAtiva
      ? camadasTematicas.filter((c) => `${c.label} ${c.grupo ?? ""}`.toLowerCase().includes(termoBusca))
      : categoriaAtiva === "favoritas"
        ? camadasFavoritas
        : categoriaAtiva === "todas"
          ? camadasTematicas
          : camadasTematicas.filter((c) => (c.grupo ?? "outros") === categoriaAtiva)

    return [...base].sort((a, b) => a.label.localeCompare(b.label))
  }, [buscaAtiva, camadasTematicas, termoBusca, categoriaAtiva, camadasFavoritas])

  // Se a aba "favoritas" ficar sem itens (usuário desmarcou o último), volta
  // para "todas" para não deixar o painel vazio sem explicação.
  useEffect(() => {
    if (categoriaAtiva === "favoritas" && camadasFavoritas.length === 0) {
      setCategoriaAtiva("todas")
    }
  }, [categoriaAtiva, camadasFavoritas.length])

  const gruposUsados = useMemo(() => {
    const usados = new Set<string>()
    slots.forEach((id, idx) => {
      if (idx !== slotAtivo && id) {
        const camada = CAMADAS_DISPONIVEIS[id]
        if (camada?.grupo) {
          usados.add(camada.grupo)
        }
      }
    })
    return usados
  }, [slots, slotAtivo])

  // Mostra o painel de variáveis sempre que QUALQUER slot ativo for uma
  // camada de setor censitário — não só quando o slot em edição for essa
  // camada. Antes, trocar de aba (Tema 1 → Tema 2) fazia o painel sumir mesmo
  // com a camada de setores continuando ativa e colorida no mapa.
  const mostrarVariaveisSetor = slots.some((id) => camadasComVariaveis.has(id))
  const termoBuscaVariaveis = buscaVariaveis.trim().toLowerCase()

  // Catálogo normalizado: mescla o que veio da API com os metadados curados
  // (nome/descrição mais claros) das variáveis priorizadas.
  const catalogoNormalizado = useMemo(() => {
    if (!variaveisSetor) return null
    const mapaVariaveis = new Map(variaveisSetor.map((variavel) => [variavel.codigo, variavel]))
    const combinadas = VARIAVEIS_SETOR_PRIORIZADAS.map((prioritaria) => ({
      ...prioritaria,
      ...(mapaVariaveis.get(prioritaria.codigo) ?? {}),
    }))
    const restantes = variaveisSetor.filter((variavel) => !CODIGOS_VARIAVEIS_PRIORIZADAS.has(variavel.codigo))
    const combinado = [...combinadas, ...normalizarVariaveisSetor(restantes)]
    return ordenarPorPrioridade(combinado, ordemVariaveisSetor)
  }, [variaveisSetor, ordemVariaveisSetor])

  const dominiosDisponiveis = useMemo(() => {
    if (!catalogoNormalizado) return []
    const contagem = new Map<string, number>()
    catalogoNormalizado.forEach((v) => {
      const dominio = obterDominioVariavel(v.codigo)
      contagem.set(dominio, (contagem.get(dominio) ?? 0) + 1)
    })
    return DOMINIOS_VARIAVEL.filter((d) => contagem.has(d.key)).map((d) => ({
      ...d,
      total: contagem.get(d.key) ?? 0,
    }))
  }, [catalogoNormalizado])

  const catalogoFiltrado = useMemo(() => {
    if (!catalogoNormalizado) return null
    const porDominio = dominioVariavel
      ? catalogoNormalizado.filter((v) => obterDominioVariavel(v.codigo) === dominioVariavel)
      : catalogoNormalizado

    if (termoBuscaVariaveis.length === 0) return porDominio

    return porDominio.filter((variavel) => {
      const texto = `${variavel.codigo} ${variavel.nome} ${variavel.descricao ?? ""} ${variavel.unidade ?? ""}`.toLowerCase()
      return texto.includes(termoBuscaVariaveis)
    })
  }, [catalogoNormalizado, dominioVariavel, termoBuscaVariaveis])

  const catalogoOrdenado = useMemo(() => {
    if (!catalogoFiltrado) return null
    if (ordenacaoVariaveis === "alfabetica") {
      return [...catalogoFiltrado].sort((a, b) => a.nome.localeCompare(b.nome))
    }
    return catalogoFiltrado
  }, [catalogoFiltrado, ordenacaoVariaveis])

  const filtrosVariaveisAtivos = termoBuscaVariaveis.length > 0 || dominioVariavel !== null

  // Organiza o catálogo em prateleiras (favoritas / recentes / sugeridas /
  // completo) no modo de navegação padrão; vira uma lista simples quando há
  // busca ou filtro de domínio ativo, onde prateleiras não fazem sentido.
  const secoesVariaveis = useMemo((): SecoesVariaveisFlat | SecoesVariaveisAgrupadas | null => {
    if (!catalogoOrdenado) return null
    if (filtrosVariaveisAtivos) {
      return { modo: "flat", itens: catalogoOrdenado }
    }

    const favoritas = catalogoOrdenado.filter((v) => favoritosVariaveis.has(v.codigo))
    const codigosFavoritas = new Set(favoritas.map((v) => v.codigo))

    const recentes = recentesVariaveis
      .map((codigo) => catalogoOrdenado.find((v) => v.codigo === codigo))
      .filter((v): v is VariavelCatalogo => v !== undefined && !codigosFavoritas.has(v.codigo))
      .slice(0, 5)
    const codigosRecentes = new Set(recentes.map((v) => v.codigo))

    const sugeridas = catalogoOrdenado.filter(
      (v) =>
        CODIGOS_VARIAVEIS_PRIORIZADAS.has(v.codigo) &&
        !codigosFavoritas.has(v.codigo) &&
        !codigosRecentes.has(v.codigo)
    )

    return { modo: "secoes", favoritas, recentes, sugeridas, todas: catalogoOrdenado }
  }, [catalogoOrdenado, filtrosVariaveisAtivos, favoritosVariaveis, recentesVariaveis])

  const variavelSelecionadaInfo = useMemo(() => {
    if (!catalogoNormalizado || !variavelSetorSelecionada) return null
    return catalogoNormalizado.find((v) => v.codigo === variavelSetorSelecionada) ?? null
  }, [catalogoNormalizado, variavelSetorSelecionada])

  // Ref com a seleção mais recente, usada dentro do efeito de fetch abaixo
  // sem precisar declarar variavelSetorSelecionada como dependência (ver nota
  // no efeito — isso é o que evita o refetch do catálogo a cada clique).
  const variavelSelecionadaRef = useRef(variavelSetorSelecionada)
  useEffect(() => {
    variavelSelecionadaRef.current = variavelSetorSelecionada
  }, [variavelSetorSelecionada])

  useEffect(() => {
    if (!mostrarVariaveisSetor) {
      return
    }

    let cancelado = false

    fetchVariaveis("setor_censitario", 100)
      .then((variaveis) => {
        if (cancelado) return

        setErroVariaveis(null)
        setVariaveisSetor(normalizarVariaveisSetor(variaveis))

        const selecaoAtual = variavelSelecionadaRef.current
        const selecaoAindaValida = selecaoAtual && variaveis.some((item) => item.codigo === selecaoAtual)

        if (!selecaoAindaValida) {
          const primeira = normalizarVariaveisSetor(variaveis)[0]?.codigo
          if (primeira) {
            onVariavelSetorChange(primeira)
          }
        }
      })
      .catch((erro) => {
        if (!cancelado) {
          setErroVariaveis(erro instanceof Error ? erro.message : "Erro ao carregar variáveis.")
        }
      })

    return () => {
      cancelado = true
    }
    // Propositalmente SEM variavelSetorSelecionada/onVariavelSetorChange nas
    // dependências: buscar o catálogo de novo a cada troca de variável seria
    // um refetch completo e desnecessário só para trocar a cor no mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarVariaveisSetor])

  const slotLabel = (slot: number) => (slot === 0 ? "Base" : `Tema ${slot}`)

  // Cartão de uma variável — reutilizado nas prateleiras e na lista filtrada.
  const renderCartaoVariavel = (variavel: VariavelCatalogo) => {
    const selecionada = variavelSetorSelecionada === variavel.codigo
    const favorita = favoritosVariaveis.has(variavel.codigo)
    const expandida = variavelExpandida === variavel.codigo
    const dominio = obterDominioVariavel(variavel.codigo)
    const cor = CORES_DOMINIO[dominio] ?? CORES_DOMINIO.outras

    return (
      <div
        key={variavel.codigo}
        className={`overflow-hidden rounded-md border transition ${
          selecionada ? "border-primary bg-primary/10" : "border-border/70 bg-background hover:border-primary/30"
        }`}
        style={{ borderLeftWidth: 3, borderLeftColor: selecionada ? cor : "transparent" }}
      >
        <div className="flex items-start gap-1 px-2.5 py-2">
          <button
            type="button"
            onClick={() => selecionarVariavel(variavel.codigo)}
            className="flex flex-1 items-start gap-2 text-left"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] font-semibold text-foreground">{variavel.codigo}</span>
                {selecionada && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                    Ativa
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{variavel.nome}</span>
            </span>
            {variavel.unidade && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {variavel.unidade}
              </span>
            )}
          </button>
          <div className="flex shrink-0 items-center gap-0.5">
            {variavel.descricao && (
              <button
                type="button"
                onClick={() => setVariavelExpandida((atual) => (atual === variavel.codigo ? null : variavel.codigo))}
                aria-label="Ver descrição da variável"
                className={`rounded p-1 transition ${
                  expandida ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
                }`}
              >
                <InfoIcon />
              </button>
            )}
            <button
              type="button"
              onClick={() => alternarFavoritoVariavel(variavel.codigo)}
              aria-label={favorita ? "Remover variável dos favoritos" : "Adicionar variável aos favoritos"}
              className={`rounded p-1 transition ${
                favorita ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500"
              }`}
            >
              <StarIcon preenchida={favorita} />
            </button>
          </div>
        </div>

        {expandida && variavel.descricao && (
          <div className="border-t border-border/60 bg-muted/30 px-2.5 py-2 text-[10px] leading-4 text-muted-foreground">
            <span
              className="mb-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: `${cor}20`, color: cor }}
            >
              {labelDominioVariavel(dominio)}
            </span>
            <p>{variavel.descricao}</p>
          </div>
        )}
      </div>
    )
  }

  const renderSecaoTitulo = (titulo: string, total: number) => (
    <div className="mb-1 mt-2.5 flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
      <span>{titulo}</span>
      <span className="font-normal normal-case text-muted-foreground/50">({total})</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <LayersIcon />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Catálogo de camadas
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/80">
              Organize a visualização por tema espacial
            </p>
          </div>
        </div>
      </div>

      {/* Camadas ativas: visão geral dos 3 slots com troca e remoção diretas,
          sem precisar caçar a camada dentro do grupo dela. */}
      <div className="flex flex-wrap gap-1.5">
        {[0, 1, 2].map((slot) => {
          const valorAtual = slots[slot] ?? ""
          const label = slotLabel(slot)
          const config = valorAtual ? CAMADAS_DISPONIVEIS[valorAtual] : undefined
          const nomeAtual = config?.label ?? "Nenhuma"
          const ativo = slotAtivo === slot

          return (
            <div
              key={slot}
              className={`group flex items-center gap-1 rounded-md border py-1 pl-2.5 pr-1 text-[11px] transition ${
                ativo
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <button type="button" onClick={() => setSlotAtivo(slot)} className="flex items-center gap-1.5">
                {config && (
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: obterCorCamada(config.estilo) }}
                  />
                )}
                <span className="font-semibold">{label}</span>
                <span className="opacity-75">{nomeAtual}</span>
              </button>
              {valorAtual && (
                <button
                  type="button"
                  onClick={() => onLimpar(slot)}
                  aria-label={`Remover camada do slot ${label}`}
                  className="rounded p-0.5 text-muted-foreground/70 opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>

      {mostrarVariaveisSetor && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Variáveis do setor censitário
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/80">
              Escolha uma variável para colorir os setores no mapa.
            </p>
          </div>
        
          {/* Resumo fixo da variável ativa: nome, unidade, e a distribuição
              real dos valores já carregados (histograma + min/média/max) —
              antes disso não existia nenhum feedback sobre o que a cor no
              mapa representava. */}
          {variavelSelecionadaInfo && (
            <div className="mb-2.5 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] font-semibold text-primary">{variavelSelecionadaInfo.codigo}</p>
                  <p className="text-[11px] text-foreground">{variavelSelecionadaInfo.nome}</p>
                </div>
                {variavelSelecionadaInfo.unidade && (
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                    {variavelSelecionadaInfo.unidade}
                  </span>
                )}
              </div>

              {estatisticasVariavelSetor ? (
                <div className="mt-2">
                  <div className="flex h-5 items-end gap-[2px]">
                    {estatisticasVariavelSetor.histograma.map((contagem, indice) => {
                      const maiorContagem = Math.max(...estatisticasVariavelSetor.histograma, 1)
                      const alturaPercentual = Math.max(10, (contagem / maiorContagem) * 100)
                      const numBins = estatisticasVariavelSetor.histograma.length
                      const cor = corRampaSequencial(indice / Math.max(1, numBins - 1), coresPaleta)
                      const amplitude = estatisticasVariavelSetor.max - estatisticasVariavelSetor.min || 1
                      const inicioFaixa = estatisticasVariavelSetor.min + (amplitude * indice) / numBins
                      const fimFaixa = estatisticasVariavelSetor.min + (amplitude * (indice + 1)) / numBins
                      return (
                        <div
                          key={indice}
                          className="flex-1 rounded-[1px]"
                          style={{ height: `${alturaPercentual}%`, backgroundColor: cor }}
                          title={`${Math.round(inicioFaixa).toLocaleString()} – ${Math.round(fimFaixa).toLocaleString()}: ${contagem.toLocaleString()} setores`}
                        />
                      )
                    })}
                  </div>

                  {/* Rótulos de faixa no "eixo x": uma marcação em cada fronteira entre
                      barras (numBins + 1 no total), centralizada no espaço/linha divisória
                      entre uma barra e a próxima — como um eixo de régua. */}
                  <div className="relative mt-0.5 h-3 text-[7px] leading-none text-muted-foreground/70">
                    {Array.from({ length: estatisticasVariavelSetor.histograma.length + 1 }).map((_, indice) => {
                      const numBins = estatisticasVariavelSetor.histograma.length
                      const amplitude = estatisticasVariavelSetor.max - estatisticasVariavelSetor.min || 1
                      const valorFaixa = estatisticasVariavelSetor.min + (amplitude * indice) / numBins
                      const primeiro = indice === 0
                      const ultimo = indice === numBins
                      return (
                        <span
                          key={indice}
                          className={`absolute top-0 ${
                            primeiro ? "" : ultimo ? "-translate-x-full" : "-translate-x-1/2"
                          }`}
                          style={{ left: `${(indice / numBins) * 100}%` }}
                        >
                          {formatarValorFaixa(valorFaixa)}
                        </span>
                      )
                    })}
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    {estatisticasVariavelSetor.total.toLocaleString()} setores no recorte atual do mapa
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Aproxime o mapa para carregar a distribuição de valores.
                </p>
              )}
            </div>
          )}

          {onPaletaVariavelChange && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Cores:</span>
              {Object.entries(PALETAS_VARIAVEL).map(([key, paleta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onPaletaVariavelChange(key as PaletaVariavelKey)}
                  title={paleta.label}
                  aria-label={`Usar paleta ${paleta.label}`}
                  className={`h-5 w-8 overflow-hidden rounded-md border transition ${
                    paletaVariavel === key ? "border-primary ring-2 ring-primary/30" : "border-border/70 hover:border-primary/40"
                  }`}
                  style={{ background: `linear-gradient(to right, ${paleta.cores.join(", ")})` }}
                />
              ))}
            </div>
          )}

          <div className="mb-2 flex items-center gap-1.5">
            <div className="relative flex flex-1 items-center">
              <span className="pointer-events-none absolute left-2.5 text-muted-foreground">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={buscaVariaveis}
                onChange={(e) => setBuscaVariaveis(e.target.value)}
                placeholder="Buscar por código, nome ou descrição..."
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-7 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              {buscaVariaveis && (
                <button
                  type="button"
                  onClick={() => setBuscaVariaveis("")}
                  aria-label="Limpar busca de variáveis"
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOrdenacaoVariaveis((atual) => (atual === "padrao" ? "alfabetica" : "padrao"))}
              title={ordenacaoVariaveis === "padrao" ? "Ordenar de A a Z" : "Ordenar por relevância"}
              className="shrink-0 rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              {ordenacaoVariaveis === "padrao" ? "Relevância" : "A–Z"}
            </button>
          </div>

          {dominiosDisponiveis.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              <button type="button" onClick={() => setDominioVariavel(null)} className={classeChip(dominioVariavel === null)}>
                Todas
              </button>
              {dominiosDisponiveis.map((dominio) => (
                <button
                  key={dominio.key}
                  type="button"
                  onClick={() => setDominioVariavel((atual) => (atual === dominio.key ? null : dominio.key))}
                  className={classeChip(dominioVariavel === dominio.key)}
                >
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CORES_DOMINIO[dominio.key] }}
                  />
                  {dominio.label} ({dominio.total})
                </button>
              ))}
            </div>
          )}

          {erroVariaveis ? (
            <p className="text-[11px] text-red-500">{erroVariaveis}</p>
          ) : secoesVariaveis === null ? (
            <div className="space-y-1.5" aria-live="polite" aria-label="Carregando variáveis">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 animate-pulse rounded-md bg-muted/60" />
              ))}
            </div>
          ) : secoesVariaveis.modo === "flat" ? (
            secoesVariaveis.itens.length > 0 ? (
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
                {secoesVariaveis.itens.map(renderCartaoVariavel)}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Nenhuma variável encontrada{dominioVariavel ? ` em "${labelDominioVariavel(dominioVariavel)}"` : ""}.
                Tente outro termo ou limpe o filtro.
              </p>
            )
          ) : (
            <div className="flex max-h-72 flex-col overflow-y-auto pr-1">
              {secoesVariaveis.favoritas.length > 0 && (
                <>
                  {renderSecaoTitulo("★ Favoritas", secoesVariaveis.favoritas.length)}
                  <div className="flex flex-col gap-1">{secoesVariaveis.favoritas.map(renderCartaoVariavel)}</div>
                </>
              )}
              {secoesVariaveis.recentes.length > 0 && (
                <>
                  {renderSecaoTitulo("Usadas recentemente", secoesVariaveis.recentes.length)}
                  <div className="flex flex-col gap-1">{secoesVariaveis.recentes.map(renderCartaoVariavel)}</div>
                </>
              )}
              {secoesVariaveis.sugeridas.length > 0 && (
                <>
                  {renderSecaoTitulo(labelSugeridas ?? "Sugeridas para vulnerabilidade", secoesVariaveis.sugeridas.length)}
                  <div className="flex flex-col gap-1">{secoesVariaveis.sugeridas.map(renderCartaoVariavel)}</div>
                </>
              )}
              {renderSecaoTitulo("Catálogo completo", secoesVariaveis.todas.length)}
              <div className="flex flex-col gap-1">{secoesVariaveis.todas.map(renderCartaoVariavel)}</div>
            </div>
          )}
        </div>
      )}

      {slotAtivo === 0 ? (
        <div className="rounded-lg border border-border bg-card p-2.5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Camada base
          </div>
          <div className="flex flex-wrap gap-1.5">
            {camadasBase.map((camada) => {
              const ativo = slots[0] === camada.id
              return (
                <button
                  key={camada.id}
                  type="button"
                  onClick={() => (ativo ? onLimpar(0) : onSet(0, camada.id))}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition ${
                    ativo
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full ring-1 ring-border" style={{ backgroundColor: obterCorCamada(camada.estilo) }} />
                  <span>{camada.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Busca: varre todas as camadas temáticas, independente da aba ativa */}
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-2.5 text-muted-foreground">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar camada em todos os grupos..."
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-7 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>

          {/* Abas de categoria: substituem o antigo accordion — trocar de tema
              não exige rolar por grupos colapsados. Somem durante a busca. */}
          {!buscaAtiva && (
            <div className="scrollbar-themed flex gap-1 overflow-x-auto pb-1">
              {camadasFavoritas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoriaAtiva("favoritas")}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                    categoriaAtiva === "favoritas"
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  ★ Favoritas
                </button>
              )}
              <button
                type="button"
                onClick={() => setCategoriaAtiva("todas")}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                  categoriaAtiva === "todas"
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                Todas
              </button>
              {gruposComConteudo.map((grupo) => (
                <button
                  key={grupo.key}
                  type="button"
                  onClick={() => setCategoriaAtiva(grupo.key)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                    categoriaAtiva === grupo.key
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {grupo.label}
                </button>
              ))}
            </div>
          )}

          {/* Grade de camadas da aba/busca ativa, com estrela de favorito e
              ícone de geometria (ponto/linha/área) em cada item. */}
          <div className="scrollbar-themed flex max-h-[42vh] flex-col gap-1.5 overflow-y-auto pr-1">
            {camadasExibidas.length === 0 && (
              <p className="px-1 py-3 text-center text-[11px] text-muted-foreground">
                {buscaAtiva ? "Nenhuma camada encontrada. Tente outro termo." : "Nenhuma camada nesta categoria."}
              </p>
            )}

            {camadasExibidas.map((camada) => {
              const ativo = slots[slotAtivo] === camada.id
              const desabilitado = camada.grupo ? gruposUsados.has(camada.grupo) && !ativo : false
              const favorita = favoritos.has(camada.id)

              return (
                <div
                  key={camada.id}
                  className={`group flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition ${
                    ativo
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  } ${desabilitado ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <button
                    type="button"
                    disabled={desabilitado}
                    onClick={() => (ativo ? onLimpar(slotAtivo) : onSet(slotAtivo, camada.id))}
                    className="flex flex-1 items-center gap-1.5 text-left disabled:cursor-not-allowed"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: obterCorCamada(camada.estilo) }}
                    />
                    <span className="text-muted-foreground/70">
                      <GeometryIcon geometry={camada.geometry} />
                    </span>
                    <span className="flex-1">{camada.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarFavorito(camada.id)}
                    aria-label={favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    className={`shrink-0 rounded p-0.5 transition ${
                      favorita
                        ? "text-amber-500"
                        : "text-muted-foreground/40 opacity-0 hover:text-amber-500 group-hover:opacity-100"
                    }`}
                  >
                    <StarIcon preenchida={favorita} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function LayerMenu({
  slots,
  onSetSlot,
  onLimparSlot,
  opacidade,
  onOpacityChange,
  periodoCadUnico,
  periodosCadUnico,
  onPeriodoCadUnicoChange,
  variavelSetorSelecionada,
  onVariavelSetorChange,
  estatisticasVariavelSetor,
  ordemVariaveisSetor,
  labelSugeridas,
  paletaVariavel,
  onPaletaVariavelChange,
}: LayerMenuProps) {
  const cadunicoAtivo = slots.includes("cadunico")

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto p-3 pb-0">
        <section aria-label="Camadas">
          <LayerSelects
            slots={slots}
            onSet={onSetSlot}
            onLimpar={onLimparSlot}
            variavelSetorSelecionada={variavelSetorSelecionada}
            onVariavelSetorChange={onVariavelSetorChange}
            estatisticasVariavelSetor={estatisticasVariavelSetor}
            ordemVariaveisSetor={ordemVariaveisSetor}
            labelSugeridas={labelSugeridas}
            paletaVariavel={paletaVariavel}
            onPaletaVariavelChange={onPaletaVariavelChange}
          />
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-3 pt-3">
        <section aria-label="Opacidade das camadas">
          <OpacitySlider value={opacidade} onChange={onOpacityChange} />
        </section>

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
      </div>
    </div>
  )
  
}