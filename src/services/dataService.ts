import type { FeatureCollection } from "geojson"

// Camadas disponíveis 
export interface CamadaConfig {
  id: string
  label: string
  estilo: object
  geometry?: "ponto" | "linha" | "area" | "desconhecido"
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
  municipios: { id: "municipios", label: "Municípios", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  bacias: { id: "bacias", label: "Bacias Hidrográficas", estilo: { color: "#10b981", weight: 2, fillOpacity: 0.2 }, geometry: "area" },
  cadunico: { id: "cadunico", label: "CadÚnico", temporal: true, estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  curvas_nivel: { id: "curvas_nivel", label: "Curvas de Nível", estilo: { color: "#8b5cf6", weight: 1, opacity: 0.6 }, geometry: "linha" },
  localidades: { id: "localidades", label: "Localidades", estilo: { color: "#f43f5e", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  area_afetada_2024: { id: "area_afetada_2024", label: "Área Afetada 2024", estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  coeficiente_de_mortalidade_geral_2018_coredes: { id: "coeficiente_de_mortalidade_geral_2018_coredes", label: "Coeficiente De Mortalidade Geral 2018 Coredes", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  coeficiente_de_mortalidade_geral_2018_rs: { id: "coeficiente_de_mortalidade_geral_2018_rs", label: "Coeficiente De Mortalidade Geral 2018 Rs", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  distribuicao_dos_leitos_hospitalares_2020_rs: { id: "distribuicao_dos_leitos_hospitalares_2020_rs", label: "Distribuicao Dos Leitos Hospitalares 2020 Rs", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  distribuicao_dos_leitos_de_uti_2020_rs: { id: "distribuicao_dos_leitos_de_uti_2020_rs", label: "Distribuicao Dos Leitos De Uti 2020 Rs", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  estabelecimentos_hospitalares_2020_coredes: { id: "estabelecimentos_hospitalares_2020_coredes", label: "Estabelecimentos Hospitalares 2020 Coredes", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  estabelecimentos_hospitalares_2020_rs: { id: "estabelecimentos_hospitalares_2020_rs", label: "Estabelecimentos Hospitalares 2020 Rs", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  idese_total_por_corede_no_rs_2015: { id: "idese_total_por_corede_no_rs_2015", label: "Idese Total Por Corede No Rs 2015", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  idese_total_por_municipio_no_rs_2015: { id: "idese_total_por_municipio_no_rs_2015", label: "Idese Total Por Municipio No Rs 2015", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  esperanca_de_vida_ao_nascer_2010_rs: { id: "esperanca_de_vida_ao_nascer_2010_rs", label: "Esperanca De Vida Ao Nascer 2010 Rs", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  indice_de_envelhecimento_2020_coredes: { id: "indice_de_envelhecimento_2020_coredes", label: "Indice De Envelhecimento 2020 Coredes", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  leitos_de_uti_2020_coredes: { id: "leitos_de_uti_2020_coredes", label: "Leitos De Uti 2020 Coredes", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  leitos_hospitalares_2020_coredes: { id: "leitos_hospitalares_2020_coredes", label: "Leitos Hospitalares 2020 Coredes", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  indice_de_envelhecimento_2020_br: { id: "indice_de_envelhecimento_2020_br", label: "Indice De Envelhecimento 2020 Br", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  esperanca_de_vida_ao_nascer_para_ambos_os_sexos_2010_br: { id: "esperanca_de_vida_ao_nascer_para_ambos_os_sexos_2010_br", label: "Esperanca De Vida Ao Nascer Para Ambos Os Sexos 2010 Br", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  leitos_hospitalares_por_mil_habitantes_2020_coredes: { id: "leitos_hospitalares_por_mil_habitantes_2020_coredes", label: "Leitos Hospitalares Por Mil Habitantes 2020 Coredes", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  partos_de_maes_com_menos_de_20_anos_2018_coredes: { id: "partos_de_maes_com_menos_de_20_anos_2018_coredes", label: "Partos De Maes Com Menos De 20 Anos 2018 Coredes", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  percentual_de_atendimento_total_de_agua_no_rs_2018: { id: "percentual_de_atendimento_total_de_agua_no_rs_2018", label: "Percentual De Atendimento Total De Agua No Rs 2018", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  percentual_de_atendimento_total_de_esgoto_no_rs_2018: { id: "percentual_de_atendimento_total_de_esgoto_no_rs_2018", label: "Percentual De Atendimento Total De Esgoto No Rs 2018", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  bloqueio_rodovias_prf: { id: "bloqueio_rodovias_prf", label: "Bloqueio Rodovias Prf", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  percentual_de_atendimento_urbano_de_agua_no_rs_2018: { id: "percentual_de_atendimento_urbano_de_agua_no_rs_2018", label: "Percentual De Atendimento Urbano De Agua No Rs 2018", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  centros_humanitarios: { id: "centros_humanitarios", label: "Centros Humanitarios", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  percentual_de_cobertura_de_coleta_de_residuos_urbanos_no_rs_2018: { id: "percentual_de_cobertura_de_coleta_de_residuos_urbanos_no_rs_2018", label: "Percentual De Cobertura De Coleta De Residuos Urbanos No Rs 2018", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  percentual_de_esgoto_tratado_no_rs_2018: { id: "percentual_de_esgoto_tratado_no_rs_2018", label: "Percentual De Esgoto Tratado No Rs 2018", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  populacao_absoluta_2020_coredes: { id: "populacao_absoluta_2020_coredes", label: "Populacao Absoluta 2020 Coredes", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  percentual_de_partos_de_maes_com_menos_de_20_anos_de_idade_2018_rs: { id: "percentual_de_partos_de_maes_com_menos_de_20_anos_de_idade_2018_rs", label: "Percentual De Partos De Maes Com Menos De 20 Anos De Idade 2018 Rs", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  populacao_absoluta_2020_br: { id: "populacao_absoluta_2020_br", label: "Populacao Absoluta 2020 Br", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  renda_per_capita_2010_rs: { id: "renda_per_capita_2010_rs", label: "Renda Per Capita 2010 Rs", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  renda_per_capita_2010_br: { id: "renda_per_capita_2010_br", label: "Renda Per Capita 2010 Br", estilo: { color: "#7c3aed", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  danos_hum_enxurrada_2017_2022: { id: "danos_hum_enxurrada_2017_2022", label: "Danos Hum Enxurrada 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_chuva_inten_2017_2022: { id: "danos_hum_chuva_inten_2017_2022", label: "Danos Hum Chuva Inten 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_estiagem_seca_2017_2022: { id: "danos_hum_estiagem_seca_2017_2022", label: "Danos Hum Estiagem Seca 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_mov_massa_2017_2022: { id: "danos_hum_mov_massa_2017_2022", label: "Danos Hum Mov Massa 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_granizo_2017_2022: { id: "danos_hum_granizo_2017_2022", label: "Danos Hum Granizo 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_inundacao_2017_2022: { id: "danos_hum_inundacao_2017_2022", label: "Danos Hum Inundacao 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  area_diretamente_atingida_2024: { id: "area_diretamente_atingida_2024", label: "Area Diretamente Atingida 2024", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_tornado_2017_2022: { id: "danos_hum_tornado_2017_2022", label: "Danos Hum Tornado 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_alagamento_2017_2022: { id: "danos_mat_alagamento_2017_2022", label: "Danos Mat Alagamento 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_hum_vendaval_2017_2022: { id: "danos_hum_vendaval_2017_2022", label: "Danos Hum Vendaval 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_enxurrada_2017_2022: { id: "danos_mat_enxurrada_2017_2022", label: "Danos Mat Enxurrada 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_estiagem_seca_2017_2022: { id: "danos_mat_estiagem_seca_2017_2022", label: "Danos Mat Estiagem Seca 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_granizo_2017_2022: { id: "danos_mat_granizo_2017_2022", label: "Danos Mat Granizo 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_mov_massa_2017_2022: { id: "danos_mat_mov_massa_2017_2022", label: "Danos Mat Mov Massa 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_tornado_2017_2022: { id: "danos_mat_tornado_2017_2022", label: "Danos Mat Tornado 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_mat_vendaval_2017_2022: { id: "danos_mat_vendaval_2017_2022", label: "Danos Mat Vendaval 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  danos_materiais_numero_de_atingidos_inundacao_2017_a_2022: { id: "danos_materiais_numero_de_atingidos_inundacao_2017_a_2022", label: "Danos Materiais Numero De Atingidos Inundacao 2017 A 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_alagamento_rs_2003_2022: { id: "numero_ocorrencias_alagamento_rs_2003_2022", label: "Numero Ocorrencias Alagamento Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  municipios_crepdec: { id: "municipios_crepdec", label: "Municipios Crepdec", estilo: { color: "#6b7280", weight: 1.5, fillOpacity: 0.1 }, geometry: "desconhecido" },
  desastres_naturais_serie_historica_2003_2022: { id: "desastres_naturais_serie_historica_2003_2022", label: "Desastres Naturais Serie Historica 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_chuva_intensa_rs_2003_2022: { id: "numero_ocorrencias_chuva_intensa_rs_2003_2022", label: "Numero Ocorrencias Chuva Intensa Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_ciclone_rs_2003_2022: { id: "numero_ocorrencias_ciclone_rs_2003_2022", label: "Numero Ocorrencias Ciclone Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_estiagem_seca_rs_2003_2022: { id: "numero_ocorrencias_estiagem_seca_rs_2003_2022", label: "Numero Ocorrencias Estiagem Seca Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_geada_rs_2003_2022: { id: "numero_ocorrencias_geada_rs_2003_2022", label: "Numero Ocorrencias Geada Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_enxurrada_rs_2003_2022: { id: "numero_ocorrencias_enxurrada_rs_2003_2022", label: "Numero Ocorrencias Enxurrada Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_inundacao_rs_2003_2022: { id: "numero_ocorrencias_inundacao_rs_2003_2022", label: "Numero Ocorrencias Inundacao Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_movimento_massa_rs_2003_2022: { id: "numero_ocorrencias_movimento_massa_rs_2003_2022", label: "Numero Ocorrencias Movimento Massa Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_ocorrencias_vendaval_rs_2003_2022: { id: "numero_ocorrencias_vendaval_rs_2003_2022", label: "Numero Ocorrencias Vendaval Rs 2003 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_de_ocorrencias_de_granizo_no_rs_2003_a_2022: { id: "numero_de_ocorrencias_de_granizo_no_rs_2003_a_2022", label: "Numero De Ocorrencias De Granizo No Rs 2003 A 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  numero_de_ocorrencias_de_tornado_no_rs_2003_a_2022: { id: "numero_de_ocorrencias_de_tornado_no_rs_2003_a_2022", label: "Numero De Ocorrencias De Tornado No Rs 2003 A 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_alagamento_2017_2022: { id: "prej_econ_priv_alagamento_2017_2022", label: "Prej Econ Priv Alagamento 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_chuva_int_2017_2022: { id: "prej_econ_priv_chuva_int_2017_2022", label: "Prej Econ Priv Chuva Int 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_esti_seca_2017_2022: { id: "prej_econ_priv_esti_seca_2017_2022", label: "Prej Econ Priv Esti Seca 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_eenxurrada2017_2022: { id: "prej_econ_priv_eenxurrada2017_2022", label: "Prej Econ Priv Eenxurrada2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_granizo_2017_2022: { id: "prej_econ_priv_granizo_2017_2022", label: "Prej Econ Priv Granizo 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_inundacao_2017_2022: { id: "prej_econ_priv_inundacao_2017_2022", label: "Prej Econ Priv Inundacao 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_tornado_2017_2022: { id: "prej_econ_priv_tornado_2017_2022", label: "Prej Econ Priv Tornado 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_mov_massa_2017_2022: { id: "prej_econ_priv_mov_massa_2017_2022", label: "Prej Econ Priv Mov Massa 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_priv_vendaval_2017_2022: { id: "prej_econ_priv_vendaval_2017_2022", label: "Prej Econ Priv Vendaval 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publ_alagamento_2017_2022: { id: "prej_econ_publ_alagamento_2017_2022", label: "Prej Econ Publ Alagamento 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publ_chuva_int_2017_2022: { id: "prej_econ_publ_chuva_int_2017_2022", label: "Prej Econ Publ Chuva Int 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  regionalizacao_defesa_civil_2020: { id: "regionalizacao_defesa_civil_2020", label: "Regionalizacao Defesa Civil 2020", estilo: { color: "#6b7280", weight: 1.5, fillOpacity: 0.1 }, geometry: "area" },
  prej_econ_publ_esti_seca_2017_2022: { id: "prej_econ_publ_esti_seca_2017_2022", label: "Prej Econ Publ Esti Seca 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  hidrografia_ordem_atlas_hidro: { id: "hidrografia_ordem_atlas_hidro", label: "Hidrografia Ordem Atlas Hidro", estilo: { color: "#0284c7", weight: 1.5, opacity: 0.7 }, geometry: "linha" },
  massas_agua: { id: "massas_agua", label: "Massas Agua", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  q90_lskm2_nas_bacias_simuladas: { id: "q90_lskm2_nas_bacias_simuladas", label: "Q90 Lskm2 Nas Bacias Simuladas", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  prej_econ_publ_granizo_2017_2022: { id: "prej_econ_publ_granizo_2017_2022", label: "Prej Econ Publ Granizo 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publ_inundacao_2017_2022: { id: "prej_econ_publ_inundacao_2017_2022", label: "Prej Econ Publ Inundacao 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publ_mov_massa_2017_2022: { id: "prej_econ_publ_mov_massa_2017_2022", label: "Prej Econ Publ Mov Massa 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publ_vendaval_2017_2022: { id: "prej_econ_publ_vendaval_2017_2022", label: "Prej Econ Publ Vendaval 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  prej_econ_publico_enxurrada_2017_2022: { id: "prej_econ_publico_enxurrada_2017_2022", label: "Prej Econ Publico Enxurrada 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  serie_historica_desastres_naturais_por_municipio: { id: "serie_historica_desastres_naturais_por_municipio", label: "Serie Historica Desastres Naturais Por Municipio", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  edf_edif_desenv_social_a_rf1: { id: "edf_edif_desenv_social_a_rf1", label: "Edf Edif Desenv Social A Rf1", estilo: { color: "#94a3b8", weight: 1, fillOpacity: 0.2 }, geometry: "area" },
  edf_edif_desenv_social_p_rf1: { id: "edf_edif_desenv_social_p_rf1", label: "Edf Edif Desenv Social P Rf1", estilo: { color: "#64748b", weight: 1, fillOpacity: 0.7 }, geometry: "ponto" },
  edf_edif_saneamento_a_rf1: { id: "edf_edif_saneamento_a_rf1", label: "Edf Edif Saneamento A Rf1", estilo: { color: "#94a3b8", weight: 1, fillOpacity: 0.2 }, geometry: "area" },
  edf_edif_saneamento_p_rf1: { id: "edf_edif_saneamento_p_rf1", label: "Edf Edif Saneamento P Rf1", estilo: { color: "#64748b", weight: 1, fillOpacity: 0.7 }, geometry: "ponto" },
  edf_edif_saude_a_rf1: { id: "edf_edif_saude_a_rf1", label: "Edf Edif Saude A Rf1", estilo: { color: "#94a3b8", weight: 1, fillOpacity: 0.2 }, geometry: "area" },
  edf_edif_saude_p_rf1: { id: "edf_edif_saude_p_rf1", label: "Edf Edif Saude P Rf1", estilo: { color: "#64748b", weight: 1, fillOpacity: 0.7 }, geometry: "ponto" },
  hid_barragem_a_rf1: { id: "hid_barragem_a_rf1", label: "Hid Barragem A Rf1", estilo: { color: "#991b1b", weight: 1.5, fillOpacity: 0.3 }, geometry: "area" },
  casos_chikungunya_historico: { id: "casos_chikungunya_historico", label: "Casos Chikungunya Historico", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  hid_barragem_l_rf1: { id: "hid_barragem_l_rf1", label: "Hid Barragem L Rf1", estilo: { color: "#991b1b", weight: 2, opacity: 0.8 }, geometry: "linha" },
  barragem_area: { id: "barragem_area", label: "Barragem Area", estilo: { color: "#991b1b", weight: 1.5, fillOpacity: 0.3 }, geometry: "area" },
  barragem_linha: { id: "barragem_linha", label: "Barragem Linha", estilo: { color: "#991b1b", weight: 2, opacity: 0.8 }, geometry: "linha" },
  casos_zika_historico: { id: "casos_zika_historico", label: "Casos Zika Historico", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  hid_terreno_sujeito_inundacao_a_rf1: { id: "hid_terreno_sujeito_inundacao_a_rf1", label: "Hid Terreno Sujeito Inundacao A Rf1", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  terreno_sujeito_inundacao: { id: "terreno_sujeito_inundacao", label: "Terreno Sujeito Inundacao", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  casos_de_dengue_2019: { id: "casos_de_dengue_2019", label: "Casos De Dengue 2019", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  casos_dengue_historico_pontos: { id: "casos_dengue_historico_pontos", label: "Casos Dengue Historico Pontos", estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  monitoramento_casos_chikungunya_2023: { id: "monitoramento_casos_chikungunya_2023", label: "Monitoramento Casos Chikungunya 2023", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  casos_de_dengue_2020: { id: "casos_de_dengue_2020", label: "Casos De Dengue 2020", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  monitoramento_casos_dengue_2023: { id: "monitoramento_casos_dengue_2023", label: "Monitoramento Casos Dengue 2023", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  monitoramento_casos_zika_2023: { id: "monitoramento_casos_zika_2023", label: "Monitoramento Casos Zika 2023", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  terreno_sujeito_inundacao_sema: { id: "terreno_sujeito_inundacao_sema", label: "Terreno Sujeito Inundacao Sema", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  monitoramento_haemagogus: { id: "monitoramento_haemagogus", label: "Monitoramento Haemagogus", estilo: { color: "#f59e0b", weight: 1, fillOpacity: 0.8 }, geometry: "area" },
  monitoramento_casos_chikungunya_2021: { id: "monitoramento_casos_chikungunya_2021", label: "Monitoramento Casos Chikungunya 2021", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  cobertura_vacinal_febre_amarela: { id: "cobertura_vacinal_febre_amarela", label: "Cobertura Vacinal Febre Amarela", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  monitoramento_casos_chikungunya_2022: { id: "monitoramento_casos_chikungunya_2022", label: "Monitoramento Casos Chikungunya 2022", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  prej_econ_publ_tornado_2017_2022: { id: "prej_econ_publ_tornado_2017_2022", label: "Prej Econ Publ Tornado 2017 2022", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "desconhecido" },
  monitoramento_casos_dengue_2022: { id: "monitoramento_casos_dengue_2022", label: "Monitoramento Casos Dengue 2022", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  monitoramento_casos_zika_2022: { id: "monitoramento_casos_zika_2022", label: "Monitoramento Casos Zika 2022", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  municipios_infestados_dengue_total: { id: "municipios_infestados_dengue_total", label: "Municipios Infestados Dengue Total", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  municipios_infestados_aedes_aegypti: { id: "municipios_infestados_aedes_aegypti", label: "Municipios Infestados Aedes Aegypti", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  municipios_infestados_dengue_1995: { id: "municipios_infestados_dengue_1995", label: "Municipios Infestados Dengue 1995", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  municipios_infestados_dengue_2021: { id: "municipios_infestados_dengue_2021", label: "Municipios Infestados Dengue 2021", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  febre_amarela_mun_area_afetada: { id: "febre_amarela_mun_area_afetada", label: "Febre Amarela Mun Area Afetada", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  barragens_preocupantes: { id: "barragens_preocupantes", label: "Barragens Preocupantes", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  municipios_infestados_dengue_2015: { id: "municipios_infestados_dengue_2015", label: "Municipios Infestados Dengue 2015", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  demanda_superficial: { id: "demanda_superficial", label: "Demanda Superficial", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "ponto" },
  disponibilidade_superficial_vazao_outorgavel: { id: "disponibilidade_superficial_vazao_outorgavel", label: "Disponibilidade Superficial Vazao Outorgavel", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "ponto" },
  balanco_hidrico: { id: "balanco_hidrico", label: "Balanco Hidrico", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  cadastro_snisb_20230720: { id: "cadastro_snisb_20230720", label: "Cadastro Snisb 20230720", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  coronavirus_novos_casos_por_municipio: { id: "coronavirus_novos_casos_por_municipio", label: "Coronavirus Novos Casos Por Municipio", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  limite_regioes_hidrograficas: { id: "limite_regioes_hidrograficas", label: "Limite Regioes Hidrograficas", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  limites_bacias_hidrograficas: { id: "limites_bacias_hidrograficas", label: "Limites Bacias Hidrograficas", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  covid_incidencia_100mil_hab: { id: "covid_incidencia_100mil_hab", label: "Covid Incidencia 100Mil Hab", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  limites_sub_bacias_hidrograficas: { id: "limites_sub_bacias_hidrograficas", label: "Limites Sub Bacias Hidrograficas", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  pesquisa_roadmap_climatico_sema_2024: { id: "pesquisa_roadmap_climatico_sema_2024", label: "Pesquisa Roadmap Climatico Sema 2024", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "ponto" },
  sema_respostas_roadmap_climatico: { id: "sema_respostas_roadmap_climatico", label: "Sema Respostas Roadmap Climatico", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "ponto" },
  disponibilidade_superficial_vazao_referencia: { id: "disponibilidade_superficial_vazao_referencia", label: "Disponibilidade Superficial Vazao Referencia", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "ponto" },
  bacias_hidrograficas: { id: "bacias_hidrograficas", label: "Bacias Hidrograficas", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "area" },
  areas_de_inundacao_arroio_aguas_belas_tr_50: { id: "areas_de_inundacao_arroio_aguas_belas_tr_50", label: "Areas De Inundacao Arroio Aguas Belas Tr 50", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  areas_de_inundacao_arroio_feijo_tr_50: { id: "areas_de_inundacao_arroio_feijo_tr_50", label: "Areas De Inundacao Arroio Feijo Tr 50", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  areas_de_inundacao_arroio_sao_joao_tr_50: { id: "areas_de_inundacao_arroio_sao_joao_tr_50", label: "Areas De Inundacao Arroio Sao Joao Tr 50", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  areas_de_inundacao_bacia_hidrografica_do_rio_dos_sinos_tr_100: { id: "areas_de_inundacao_bacia_hidrografica_do_rio_dos_sinos_tr_100", label: "Areas De Inundacao Bacia Hidrografica Do Rio Dos Sinos Tr 100", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  areas_de_inundacao_bacia_hidrografica_do_rio_gravatai_tr_100: { id: "areas_de_inundacao_bacia_hidrografica_do_rio_gravatai_tr_100", label: "Areas De Inundacao Bacia Hidrografica Do Rio Gravatai Tr 100", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  monitoramento_casos_zika_2021: { id: "monitoramento_casos_zika_2021", label: "Monitoramento Casos Zika 2021", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  monitoramento_dengue_2021: { id: "monitoramento_dengue_2021", label: "Monitoramento Dengue 2021", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  base_unica_unidades_saude: { id: "base_unica_unidades_saude", label: "Base Unica Unidades Saude", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  municipios_infestados_dengue_2005: { id: "municipios_infestados_dengue_2005", label: "Municipios Infestados Dengue 2005", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  hospitais_com_leitos_uti: { id: "hospitais_com_leitos_uti", label: "Hospitais Com Leitos Uti", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "ponto" },
  areas_de_inundacao_delta_do_jacui_tr_100: { id: "areas_de_inundacao_delta_do_jacui_tr_100", label: "Areas De Inundacao Delta Do Jacui Tr 100", estilo: { color: "#1d4ed8", weight: 1, fillOpacity: 0.35 }, geometry: "area" },
  municipios_infestados_por_aedes_aegypti_total: { id: "municipios_infestados_por_aedes_aegypti_total", label: "Municipios Infestados Por Aedes Aegypti Total", estilo: { color: "#d97706", weight: 1, fillOpacity: 0.3 }, geometry: "desconhecido" },
  pdvt_suscetibilidade_inundacao: { id: "pdvt_suscetibilidade_inundacao", label: "Pdvt Suscetibilidade Inundacao", estilo: { color: "#3b82f6", weight: 1, fillOpacity: 0.3 }, geometry: "area" },
  regiao_institucional_defesa_civil: { id: "regiao_institucional_defesa_civil", label: "Regiao Institucional Defesa Civil", estilo: { color: "#6b7280", weight: 1.5, fillOpacity: 0.1 }, geometry: "area" },
  municipio_por_bacia_hidrografica: { id: "municipio_por_bacia_hidrografica", label: "Municipio Por Bacia Hidrografica", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "desconhecido" },
  sede_regiao_institucional_defesa_civil: { id: "sede_regiao_institucional_defesa_civil", label: "Sede Regiao Institucional Defesa Civil", estilo: { color: "#374151", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  pdvt_sintese_risco: { id: "pdvt_sintese_risco", label: "Pdvt Sintese Risco", estilo: { color: "#ea580c", weight: 1, fillOpacity: 0.35 }, geometry: "desconhecido" },
  upas: { id: "upas", label: "Upas", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  coordenadorias_regionais_saude_sedes: { id: "coordenadorias_regionais_saude_sedes", label: "Coordenadorias Regionais Saude Sedes", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  macrorregioes_saude: { id: "macrorregioes_saude", label: "Macrorregioes Saude", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  hospitais_rs: { id: "hospitais_rs", label: "Hospitais Rs", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "ponto" },
  mort_infantil_2018: { id: "mort_infantil_2018", label: "Mort Infantil 2018", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  mort_infantil_2017: { id: "mort_infantil_2017", label: "Mort Infantil 2017", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "area" },
  ubs_rs: { id: "ubs_rs", label: "Ubs Rs", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  regioes_saude_por_municipio: { id: "regioes_saude_por_municipio", label: "Regioes Saude Por Municipio", estilo: { color: "#dc2626", weight: 1, fillOpacity: 0.25 }, geometry: "area" },
  creas_centro_de_referencia_especializado_de_assistencia_social: { id: "creas_centro_de_referencia_especializado_de_assistencia_social", label: "Creas Centro De Referencia Especializado De Assistencia Social", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  cras_protecao_social_basica: { id: "cras_protecao_social_basica", label: "Cras Protecao Social Basica", estilo: { color: "#16a34a", weight: 1, fillOpacity: 0.8 }, geometry: "ponto" },
  rs_batimetria_bloco02_taquari_parcial_01: { id: "rs_batimetria_bloco02_taquari_parcial_01", label: "Rs Batimetria Bloco02 Taquari Parcial 01", estilo: { color: "#0891b2", weight: 1.5, fillOpacity: 0.15 }, geometry: "desconhecido" },
  regiao_saude_rs_30: { id: "regiao_saude_rs_30", label: "Regiao Saude Rs 30", estilo: { color: "#22c55e", weight: 1, fillOpacity: 0.15 }, geometry: "desconhecido" },
};

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
  // ── dados locais ──────────────────────────────────────────────────────────
  municipios:        "/data/json/municipios_preview.geojson",
  bacias:            "/data/json/bacias_preview.geojson",
  curvas_nivel:      "/data/json/curvas_nivel_preview.json",
  localidades:       "/data/json/localidades_preview.json",
  area_afetada_2024: "/data/json/area_afetada_2024_preview.json",

  // ── IEDE-RS: camadas remotas ──────────────────────────────────────────────
  aeroportos: "https://iede.rs.gov.br/server/rest/services/ATLAS/Aeroportos_em_Operacao_no_Rio_Grande_do_Sul/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Risco e ocorrências de desastres naturais (ATLAS_DESASTRE_NATURAIS) ---
  danos_hum_chuva_inten_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Chuva_inten_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_enxurrada_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Enxurrada_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_estiagem_seca_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Estiagem_Seca_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_granizo_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Granizo_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_inundacao_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Inundacao_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_mov_massa_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Mov_Massa_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_tornado_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Tornado_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_hum_vendaval_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Hum_Vendaval_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_alagamento_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Alagamento_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_enxurrada_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Enxurrada_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_estiagem_seca_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Estiagem_Seca_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_granizo_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Granizo_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_mov_massa_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Mov_Massa_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_tornado_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Tornado_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_mat_vendaval_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Mat_Vendaval_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  danos_materiais_numero_de_atingidos_inundacao_2017_a_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Danos_Materiais__número_de_atingidos___Inundação___2017_a_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  desastres_naturais_serie_historica_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Desastres_naturais_serie_historica_2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_crepdec: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Municipios_crepdec/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_alagamento_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Alagamento_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_chuva_intensa_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Chuva_Intensa_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_ciclone_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Ciclone_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_enxurrada_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Enxurrada_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_estiagem_seca_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Estiagem_Seca_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_geada_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Geada_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_inundacao_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Inundacao_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_movimento_massa_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Movimento_Massa__RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_ocorrencias_vendaval_rs_2003_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Numero_Ocorrencias_Vendaval_RS___2003_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_de_ocorrencias_de_granizo_no_rs_2003_a_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Número_de_Ocorrências_de_Granizo_no_RS___2003_a_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  numero_de_ocorrencias_de_tornado_no_rs_2003_a_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Número_de_Ocorrências_de_Tornado_no_RS___2003_a_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_alagamento_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Alagamento_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_chuva_int_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Chuva_int_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_esti_seca_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Esti_Seca_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_granizo_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Granizo_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_inundacao_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Inundacao_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_mov_massa_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Mov_Massa_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_tornado_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Tornado_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_vendaval_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_Vendaval_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_priv_eenxurrada2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Priv_eEnxurrada2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_alagamento_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Alagamento_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_chuva_int_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Chuva_int_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_esti_seca_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Esti_Seca_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_granizo_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Granizo_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_inundacao_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Inundacao_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_mov_massa_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Mov_Massa_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_tornado_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Tornado_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publ_vendaval_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publ_Vendaval_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  prej_econ_publico_enxurrada_2017_2022: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Prej_Econ_Publico_Enxurrada_2017_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  serie_historica_desastres_naturais_por_municipio: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Serie_Historica_Desastres_Naturais_por_Municipio/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  terreno_sujeito_inundacao_sema: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/Terreno_Sujeito_Inundacao_SEMA/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  area_diretamente_atingida_2024: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/area_diretamente_atingida_2024/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  bloqueio_rodovias_prf: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/bloqueio_rodovias_PRF/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  centros_humanitarios: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/centros_humanitarios/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  regionalizacao_defesa_civil_2020: "https://iede.rs.gov.br/server/rest/services/ATLAS_DESASTRE_NATURAIS/regionalizacao_defesa_civil_2020/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Manchas de inundação por tempo de retorno – METROPLAN ---
  areas_de_inundacao_arroio_aguas_belas_tr_50: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Arroio_Aguas_Belas_TR_50/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  areas_de_inundacao_arroio_feijo_tr_50: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Arroio_Feijo_TR_50/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  areas_de_inundacao_arroio_sao_joao_tr_50: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Arroio_Sao_Joao_TR_50/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  areas_de_inundacao_bacia_hidrografica_do_rio_gravatai_tr_100: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Bacia_Hidrografica_do_Rio_Gravatai_TR_100/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  areas_de_inundacao_bacia_hidrografica_do_rio_dos_sinos_tr_100: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Bacia_Hidrografica_do_Rio_dos_Sinos_TR_100/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  areas_de_inundacao_delta_do_jacui_tr_100: "https://iede.rs.gov.br/server/rest/services/METROPLAN/Areas_de_Inundacao_Delta_do_Jacui_TR_100/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Base cartográfica 1:25.000 (terrenos, barragens, edificações) ---
  edf_edif_desenv_social_a_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Desenv_Social_A_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  edf_edif_desenv_social_p_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Desenv_Social_P_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  edf_edif_saneamento_a_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Saneamento_A_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  edf_edif_saneamento_p_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Saneamento_P_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  edf_edif_saude_a_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Saude_A_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  edf_edif_saude_p_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/EDF_Edif_Saude_P_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  hid_barragem_a_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/HID_Barragem_A_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  hid_barragem_l_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/HID_Barragem_L_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  hid_terreno_sujeito_inundacao_a_rf1: "https://iede.rs.gov.br/server/rest/services/BASE25/HID_Terreno_Sujeito_Inundacao_A_RF1/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Base cartográfica 1:50.000 ---
  barragem_linha: "https://iede.rs.gov.br/server/rest/services/BASE50/Barragem_Linha/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  barragem_area: "https://iede.rs.gov.br/server/rest/services/BASE50/Barragem_area/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  terreno_sujeito_inundacao: "https://iede.rs.gov.br/server/rest/services/BASE50/Terreno_sujeito_inundacao/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Risco territorial – SEDUR / PDVT ---
  pdvt_sintese_risco: "https://iede.rs.gov.br/server/rest/services/SEDUR/pdvt_sintese_risco/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  pdvt_suscetibilidade_inundacao: "https://iede.rs.gov.br/server/rest/services/SEDUR/pdvt_suscetibilidade_inundacao/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Defesa civil – SEPLAG ---
  regiao_institucional_defesa_civil: "https://iede.rs.gov.br/server/rest/services/SEPLAG/Regiao_Institucional_Defesa_Civil/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  sede_regiao_institucional_defesa_civil: "https://iede.rs.gov.br/server/rest/services/SEPLAG/Sede_Regiao_Institucional_Defesa_Civil/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Hidrologia e clima – DRH / SEMA ---
  bacias_hidrograficas: "https://iede.rs.gov.br/server/rest/services/DRH/Bacias_Hidrograficas/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  balanco_hidrico: "https://iede.rs.gov.br/server/rest/services/DRH/Balanco_Hidrico/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  barragens_preocupantes: "https://iede.rs.gov.br/server/rest/services/DRH/Barragens_preocupantes/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  cadastro_snisb_20230720: "https://iede.rs.gov.br/server/rest/services/DRH/Cadastro_SNISB_20230720/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  demanda_superficial: "https://iede.rs.gov.br/server/rest/services/DRH/Demanda_Superficial/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  disponibilidade_superficial_vazao_outorgavel: "https://iede.rs.gov.br/server/rest/services/DRH/Disponibilidade_superficial_Vazao_Outorgavel/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  disponibilidade_superficial_vazao_referencia: "https://iede.rs.gov.br/server/rest/services/DRH/Disponibilidade_superficial_Vazao_referencia/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  limites_bacias_hidrograficas: "https://iede.rs.gov.br/server/rest/services/DRH/Limites_bacias_hidrograficas/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipio_por_bacia_hidrografica: "https://iede.rs.gov.br/server/rest/services/DRH/Municipio_por_bacia_hidrografica/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  pesquisa_roadmap_climatico_sema_2024: "https://iede.rs.gov.br/server/rest/services/DRH/Pesquisa_Roadmap_Climatico_Sema_2024/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  sema_respostas_roadmap_climatico: "https://iede.rs.gov.br/server/rest/services/DRH/Sema_Respostas_Roadmap_Climatico/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  limite_regioes_hidrograficas: "https://iede.rs.gov.br/server/rest/services/DRH/limite_regioes_hidrograficas/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  limites_sub_bacias_hidrograficas: "https://iede.rs.gov.br/server/rest/services/DRH/limites_sub_bacias_hidrograficas/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Atlas Hidroenergético ---
  hidrografia_ordem_atlas_hidro: "https://iede.rs.gov.br/server/rest/services/ATLAS_HIDROENERGETICO/Hidrografia_ordem_atlas_hidro/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  massas_agua: "https://iede.rs.gov.br/server/rest/services/ATLAS_HIDROENERGETICO/Massas_agua/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  q90_lskm2_nas_bacias_simuladas: "https://iede.rs.gov.br/server/rest/services/ATLAS_HIDROENERGETICO/Q90_Lskm2_nas_bacias_simuladas/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Batimetria – SEMA ---
  rs_batimetria_bloco02_taquari_parcial_01: "https://iede.rs.gov.br/server/rest/services/SEMA_DIPLA_DRH/RS_BATIMETRIA_BLOCO02_TAQUARI_PARCIAL_01/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Saúde climática – CEVS (dengue, zika, chikungunya, febre amarela) ---
  casos_chikungunya_historico: "https://iede.rs.gov.br/server/rest/services/CEVS/Casos_chikungunya_historico/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  casos_de_dengue_2019: "https://iede.rs.gov.br/server/rest/services/CEVS/Casos_de_DENGUE_2019/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  casos_de_dengue_2020: "https://iede.rs.gov.br/server/rest/services/CEVS/Casos_de_DENGUE_2020/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  casos_dengue_historico_pontos: "https://iede.rs.gov.br/server/rest/services/CEVS/Casos_dengue_historico_pontos/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  casos_zika_historico: "https://iede.rs.gov.br/server/rest/services/CEVS/Casos_zika_historico/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_dengue_2021: "https://iede.rs.gov.br/server/rest/services/CEVS/Monitoramento_DENGUE_2021/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_haemagogus: "https://iede.rs.gov.br/server/rest/services/CEVS/Monitoramento_haemagogus/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  cobertura_vacinal_febre_amarela: "https://iede.rs.gov.br/server/rest/services/CEVS/cobertura_vacinal__febre_amarela/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  febre_amarela_mun_area_afetada: "https://iede.rs.gov.br/server/rest/services/CEVS/febre_amarela_mun_area_afetada/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_chikungunya_2021: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_chikungunya_2021/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_chikungunya_2022: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_chikungunya_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_chikungunya_2023: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_chikungunya_2023/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_dengue_2022: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_dengue_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_dengue_2023: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_dengue_2023/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_zika_2021: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_zika_2021/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_zika_2022: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_zika_2022/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  monitoramento_casos_zika_2023: "https://iede.rs.gov.br/server/rest/services/CEVS/monitoramento_casos_zika_2023/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_aedes_aegypti: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_aedes_aegypti/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_dengue_1995: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_dengue_1995/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_dengue_2005: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_dengue_2005/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_dengue_2015: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_dengue_2015/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_dengue_2021: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_dengue_2021/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_dengue_total: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_dengue_total/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  municipios_infestados_por_aedes_aegypti_total: "https://iede.rs.gov.br/server/rest/services/CEVS/municipios_infestados_por_aedes_aegypti_total/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- COVID-19 ---
  coronavirus_novos_casos_por_municipio: "https://iede.rs.gov.br/server/rest/services/COVID19/coronavirus_novos_casos_por_municipio/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  covid_incidencia_100mil_hab: "https://iede.rs.gov.br/server/rest/services/COVID19/covid_incidencia_100mil_hab/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Infraestrutura de saúde – SES ---
  hospitais_rs: "https://iede.rs.gov.br/server/rest/services/SES/Hospitais_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  hospitais_com_leitos_uti: "https://iede.rs.gov.br/server/rest/services/SES/Hospitais_com_Leitos_UTI/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  mort_infantil_2017: "https://iede.rs.gov.br/server/rest/services/SES/Mort_Infantil_2017/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  mort_infantil_2018: "https://iede.rs.gov.br/server/rest/services/SES/Mort_infantil_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  regioes_saude_por_municipio: "https://iede.rs.gov.br/server/rest/services/SES/Regioes_Saude_por_municipio/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  ubs_rs: "https://iede.rs.gov.br/server/rest/services/SES/UBS_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  upas: "https://iede.rs.gov.br/server/rest/services/SES/UPAS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  base_unica_unidades_saude: "https://iede.rs.gov.br/server/rest/services/SES/base_unica_unidades_saude/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  coordenadorias_regionais_saude_sedes: "https://iede.rs.gov.br/server/rest/services/SES/coordenadorias_regionais_saude_sedes/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  macrorregioes_saude: "https://iede.rs.gov.br/server/rest/services/SES/macrorregioes_saude/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  regiao_saude_rs_30: "https://iede.rs.gov.br/server/rest/services/SES/regiao_saude_rs_30/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Atlas 2021 (mortalidade, leitos, saneamento, vulnerabilidade) ---
  coeficiente_de_mortalidade_geral_2018_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Coeficiente_de_Mortalidade_Geral_2018_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  coeficiente_de_mortalidade_geral_2018_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Coeficiente_de_mortalidade_geral_2018_COREDES/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  distribuicao_dos_leitos_de_uti_2020_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Distribuiçao_dos_leitos_de_UTI_2020_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  distribuicao_dos_leitos_hospitalares_2020_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Distribuiçao_dos_leitos_hospitalares_2020_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  esperanca_de_vida_ao_nascer_2010_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Esperança_de_vida_ao_nascer_2010_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  esperanca_de_vida_ao_nascer_para_ambos_os_sexos_2010_br: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Esperança_de_vida_ao_nascer_para_ambos_os_sexos_2010_BR/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  estabelecimentos_hospitalares_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Estabelecimentos_hospitalares_2020_COREDES/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  estabelecimentos_hospitalares_2020_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Estabelecimentos_hospitalares_2020_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  indice_de_envelhecimento_2020_br: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Indice_de_Envelhecimento_2020_BR/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  indice_de_envelhecimento_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Indice_de_Envelhecimento_2020_COREDEs/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  leitos_de_uti_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Leitos_de_UTI_2020_COREDES/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  leitos_hospitalares_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Leitos_hospitalares_2020_COREDES/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  leitos_hospitalares_por_mil_habitantes_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Leitos_hospitalares_por_mil_habitantes_2020_COREDES/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  partos_de_maes_com_menos_de_20_anos_2018_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Partos_de_maes_com_menos_de_20_anos_2018_COREDEs/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_atendimento_total_de_agua_no_rs_2018: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_Atendimento_Total_de_Agua_no_RS_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_atendimento_total_de_esgoto_no_rs_2018: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_Atendimento_Total_de_Esgoto_no_RS_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_atendimento_urbano_de_agua_no_rs_2018: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_Atendimento_Urbano_de_Agua_no_RS_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_cobertura_de_coleta_de_residuos_urbanos_no_rs_2018: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_Cobertura_de_Coleta_de_Resíduos_Urbanos_no_RS_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_esgoto_tratado_no_rs_2018: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_Esgoto_Tratado_no_RS_2018/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  percentual_de_partos_de_maes_com_menos_de_20_anos_de_idade_2018_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Percentual_de_partos_de_mães_com_menos_de_20_anos_de_idade_2018_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  populacao_absoluta_2020_br: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Populaçao_absoluta_2020_BR/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  populacao_absoluta_2020_coredes: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Populaçao_absoluta_2020_COREDEs/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  renda_per_capita_2010_br: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Renda_per_capita_2010_BR/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  renda_per_capita_2010_rs: "https://iede.rs.gov.br/server/rest/services/ATLAS2021/Renda_per_capita_2010_RS/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Atlas (IDESE, vulnerabilidade socioeconômica) ---
  idese_total_por_corede_no_rs_2015: "https://iede.rs.gov.br/server/rest/services/ATLAS/IDESE_Total_por_Corede_no_RS_2015/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  idese_total_por_municipio_no_rs_2015: "https://iede.rs.gov.br/server/rest/services/ATLAS/IDESE_Total_por_municipio_no_RS_2015/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",

  // --- Assistência social – STAS ---
  cras_protecao_social_basica: "https://iede.rs.gov.br/server/rest/services/STAS/CRAS_Protecao_Social_Basica/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
  creas_centro_de_referencia_especializado_de_assistencia_social: "https://iede.rs.gov.br/server/rest/services/STAS/CREAS___Centro_de_Referência_Especializado_de_Assistência_Social/FeatureServer/0/query?where=1=1&outFields=*&f=geojson",
};

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

