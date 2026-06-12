import json, re
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

# Configs
INPUT_JSON = '/home/user/CRIEC-maiquel/geojson_catalogo_selecionado.json'
OUTPUT_TS = '/home/user/CRIEC-maiquel/camadas_disponiveis.ts'

# Funções auxiliares
def make_key(service):
    name = service.split('/')[-1].lower()
    for k,v in {'ã':'a','â':'a','á':'a','à':'a','é':'e','ê':'e','í':'i','ó':'o','ô':'o','õ':'o','ú':'u','ç':'c'}.items():
        name = name.replace(k, v)
    return re.sub(r'[^a-z0-9]+', '_', name).strip('_')

def detect_geometry_type(feature_collection):
    geom_types = set()
    for f in feature_collection.get("features", []):
        geom = f.get("geometry")
        if geom and "type" in geom:
            geom_types.add(geom["type"])
    if "Point" in geom_types or "MultiPoint" in geom_types:
        return "ponto"
    if "LineString" in geom_types or "MultiLineString" in geom_types:
        return "linha"
    if "Polygon" in geom_types or "MultiPolygon" in geom_types:
        return "area"
    return "desconhecido"

def fetch_geom_type(item):
    key = make_key(item['service'])
    sk  = get_style_key(item['service'])
    style = STYLES[sk]
    label = item.get('label') or auto_label(key)
    try:
        r = requests.get(item['url'], timeout=30)
        r.raise_for_status()
        gj = r.json()
        geom_type = detect_geometry_type(gj)
    except:
        geom_type = "desconhecido"
    return key, label, style, geom_type

# Outras funções
def get_style_key(service):
    s = service.lower()
    for fn, key in rules:
        try:
            if fn(s): return key
        except: pass
    return "desastre_poligono"

def auto_label(key):
    return key.replace('_', ' ').title()

# Leitura JSON
with open(INPUT_JSON, encoding='utf-8') as f:
    data = json.load(f)

# Regras e estilos
# Estilos padrões
STYLES = {
    "desastre_poligono":  '{ color: "#dc2626", weight: 1, fillOpacity: 0.25 }',
    "inundacao_area":     '{ color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }',
    "suscetibilidade":    '{ color: "#3b82f6", weight: 1, fillOpacity: 0.3 }',
    "risco_sintese":      '{ color: "#ea580c", weight: 1, fillOpacity: 0.35 }',
    "defesa_civil_area":  '{ color: "#6b7280", weight: 1.5, fillOpacity: 0.1 }',
    "defesa_civil_ponto": '{ color: "#374151", weight: 1, fillOpacity: 0.8 }',
    "barragem_area":      '{ color: "#991b1b", weight: 1.5, fillOpacity: 0.3 }',
    "barragem_linha":     '{ color: "#991b1b", weight: 2, opacity: 0.8 }',
    "hidro_area":         '{ color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }',
    "hidro_linha":        '{ color: "#0284c7", weight: 1.5, opacity: 0.7 }',
    "saude_ponto":        '{ color: "#16a34a", weight: 1, fillOpacity: 0.8 }',
    "saude_area":         '{ color: "#22c55e", weight: 1, fillOpacity: 0.15 }',
    "epidemio_area":      '{ color: "#d97706", weight: 1, fillOpacity: 0.3 }',
    "epidemio_ponto":     '{ color: "#f59e0b", weight: 1, fillOpacity: 0.8 }',
    "vulnerab_area":      '{ color: "#7c3aed", weight: 1, fillOpacity: 0.25 }',
    "assistencia_ponto":  '{ color: "#6d28d9", weight: 1, fillOpacity: 0.8 }',
    "base_ponto":         '{ color: "#64748b", weight: 1, fillOpacity: 0.7 }',
    "base_area":          '{ color: "#94a3b8", weight: 1, fillOpacity: 0.2 }',
}

# Categorias
CATEGORIES = {
    'ATLAS_DESASTRE_NATURAIS': '// --- Risco e ocorrências de desastres naturais ---',
    'METROPLAN':               '// --- Manchas de inundação por tempo de retorno – METROPLAN ---',
    'BASE25':                  '// --- Base cartográfica 1:25.000 ---',
    'BASE50':                  '// --- Base cartográfica 1:50.000 ---',
    'SEDUR':                   '// --- Risco territorial – SEDUR ---',
    'SEPLAG':                  '// --- Defesa civil – SEPLAG ---',
    'DRH':                     '// --- Hidrologia e clima – DRH ---',
    'ATLAS_HIDROENERGETICO':   '// --- Atlas Hidroenergético ---',
    'SEMA_DIPLA_DRH':          '// --- Batimetria – SEMA ---',
    'CEVS':                    '// --- Saúde climática – CEVS ---',
    'COVID19':                 '// --- COVID-19 ---',
    'SES':                     '// --- Infraestrutura de saúde – SES ---',
    'ATLAS2021':               '// --- Atlas 2021 (mortalidade, leitos, saneamento, vulnerabilidade) ---',
    'ATLAS':                   '// --- Atlas (IDESE, vulnerabilidade) ---',
    'STAS':                    '// --- Assistência social – STAS ---',
}

# Classificação de estilo por nome
rules = [
    (lambda s: "inundacao" in s and ("tr_" in s or "metroplan" in s), "inundacao_area"),
    (lambda s: "terreno_sujeito" in s or "suscetibilidade" in s, "suscetibilidade"),
    (lambda s: "sintese_risco" in s, "risco_sintese"),
    (lambda s: "barragem" in s and ("_a_" in s or "_area" in s), "barragem_area"),
    (lambda s: "barragem" in s and ("_l_" in s or "_linha" in s), "barragem_linha"),
    (lambda s: "sede" in s and "defesa" in s, "defesa_civil_ponto"),
    (lambda s: "defesa_civil" in s or "crepdec" in s, "defesa_civil_area"),
    (lambda s: "hidrografia" in s, "hidro_linha"),
    (lambda s: any(x in s for x in ["massas_agua", "bacia", "hidro", "balanco", "demanda", "vazao", "batimetria", "roadmap"]), "hidro_area"),
    (lambda s: any(x in s for x in ["hospital", "ubs_", "upas", "caps", "apae", "cras_", "creas_"]), "saude_ponto"),
    (lambda s: "cras_" in s or "creas_" in s, "assistencia_ponto"),
    (lambda s: any(x in s for x in ["macrorregiao", "regiao_saude", "coordenadoria_regional"]), "saude_area"),
    (lambda s: any(x in s for x in ["mortalidade", "leito", "estabelecimento_hospital", "esperanca_vida", "parto", "mort_"]), "saude_area"),
    (lambda s: "historico_pontos" in s or "haemagogus" in s, "epidemio_ponto"),
    (lambda s: any(x in s for x in ["dengue", "zika", "chikungunya", "febre_amarela", "aedes", "covid"]), "epidemio_area"),
    (lambda s: any(x in s for x in ["idese", "renda", "esgoto", "agua_no_rs", "residuos", "envelhecimento", "populac", "cobertura", "vulnerab", "atendimento"]), "vulnerab_area"),
    (lambda s: "_p_rf1" in s, "base_ponto"),
    (lambda s: "_a_rf1" in s, "base_area"),
]

# Flatten todos os itens de todas as categorias
all_items = []
for folder_items in data:
    all_items.append(folder_items)

# Escrevendo TS incremental
with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
    f.write('export const CAMADAS_DISPONIVEIS: Record<string, CamadaConfig> = {\n')

    # Camadas locais fixas
    f.write('  municipios: { id: "municipios", label: "Municípios", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.15 }, geometry: "area" },\n')
    f.write('  bacias: { id: "bacias", label: "Bacias Hidrográficas", estilo: { color: "#10b981", weight: 2, fillOpacity: 0.2 }, geometry: "area" },\n')
    f.write('  cadunico: { id: "cadunico", label: "CadÚnico", temporal: true, estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.15 }, geometry: "area" },\n')
    f.write('  curvas_nivel: { id: "curvas_nivel", label: "Curvas de Nível", estilo: { color: "#8b5cf6", weight: 1, opacity: 0.6 }, geometry: "linha" },\n')
    f.write('  localidades: { id: "localidades", label: "Localidades", estilo: { color: "#f43f5e", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },\n')
    f.write('  area_afetada_2024: { id: "area_afetada_2024", label: "Área Afetada 2024", estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.3 }, geometry: "area" },\n')

    # Paralelização
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_geom_type, item): item for item in all_items}
        for future in as_completed(futures):
            key, label, style, geom_type = future.result()
            f.write(f'  {key}: {{ id: "{key}", label: "{label}", estilo: {style}, geometry: "{geom_type}" }},\n')

    f.write('};\n')

print("✅ Concluído! TS gerado com paralelização e salvamento incremental.")

