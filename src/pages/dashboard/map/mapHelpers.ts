import type { FeatureCollection } from "geojson"

export const getLayerKey = (id: string, periodoCadUnico: string) =>
  id === "cadunico" ? `${id}:${periodoCadUnico}` : id

export const buildCadUnicoMap = (cadunico: FeatureCollection) => {
  const map: Record<string, any> = {}
  cadunico.features.forEach((feature: any) => {
    const cdMun = feature.properties?.codarea
    if (cdMun) {
      map[String(cdMun)] = feature.properties
    }
  })
  return map
}

export const combineMunicipiosWithCadUnico = (
  municipios: FeatureCollection,
  cadUnicoMap: Record<string, any>
): FeatureCollection => ({
  type: "FeatureCollection",
  features: municipios.features
    .map((municipio: any) => {
      const cdMun = municipio.properties?.CD_MUN
      const dadosCadUnico = cadUnicoMap[String(cdMun)]
      return dadosCadUnico
        ? {
            ...municipio,
            properties: {
              ...municipio.properties,
              ...dadosCadUnico,
            },
          }
        : null
    })
    .filter(Boolean),
})

export const pointInPolygon = (point: [number, number], polygonCoords: any) => {
  let rings: number[][][] = []
  if (Array.isArray(polygonCoords[0][0][0])) {
    rings = polygonCoords.flat()
  } else {
    rings = polygonCoords
  }

  const [x, y] = point
  let inside = false
  for (const ring of rings) {
    let j = ring.length - 1
    for (let i = 0; i < ring.length; i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
      j = i
    }
  }
  return inside
}

export const getMunicipioCentroid = (municipio: any): [number, number] | null => {
  const coords = municipio.geometry?.coordinates
  if (!coords || coords.length === 0) return null

  let totalLat = 0
  let totalLng = 0
  let count = 0

  const traverse = (arr: any) => {
    if (Array.isArray(arr[0]) && typeof arr[0][0] === "number") {
      arr.forEach(([lng, lat]: [number, number]) => {
        totalLat += lat
        totalLng += lng
        count++
      })
    } else {
      arr.forEach(traverse)
    }
  }

  traverse(coords)
  if (count === 0) return null
  return [totalLng / count, totalLat / count]
}

export const buildMunicipioToBaciaMap = (
  municipios: FeatureCollection,
  bacias: FeatureCollection
) => {
  const mapa: Record<string, string> = {}

  municipios.features.forEach((mun: any) => {
    const cdMun = mun.properties?.CD_MUN
    if (!cdMun) return

    const centroide = getMunicipioCentroid(mun)
    if (!centroide) return

    for (const bacia of bacias.features) {
      const baciaCoords = (bacia.geometry as any)?.coordinates
      if (baciaCoords && pointInPolygon(centroide, baciaCoords)) {
        mapa[cdMun] = bacia.properties?.regiao || "Desconhecida"
        break
      }
    }
  })

  return mapa
}

export const combineBaciasWithCadUnico = (
  bacias: FeatureCollection,
  municipios: FeatureCollection,
  cadunico: FeatureCollection
): FeatureCollection => {
  const municipioBacia = buildMunicipioToBaciaMap(municipios, bacias)
  const cadunicoPorMunicipio: Record<string, any> = {}

  cadunico.features.forEach((feature: any) => {
    const cdMun = feature.properties?.codarea
    if (!cdMun || cadunicoPorMunicipio[cdMun]) return
    cadunicoPorMunicipio[cdMun] = feature.properties
  })

  const estatisticasPorBacia: Record<string, any> = {}

  Object.entries(cadunicoPorMunicipio).forEach(([cdMun, props]: [string, any]) => {
    const baciaNome = municipioBacia[cdMun] || "Desconhecida"
    if (!estatisticasPorBacia[baciaNome]) {
      estatisticasPorBacia[baciaNome] = {
        municipios: 0,
        populacaoTotal: 0,
        faixa1Total: 0,
        faixa1e2Total: 0,
        taxas: [],
      }
    }

    const stats = estatisticasPorBacia[baciaNome]
    stats.municipios += 1
    stats.populacaoTotal += props.Populacao || 0
    stats.faixa1Total += props.Faixa_1 || 0
    stats.faixa1e2Total += props.Faixa_1_e_2 || 0
    stats.taxas.push(props.Taxa_Faixa_1_e_2 || 0)
  })

  Object.values(estatisticasPorBacia).forEach((stats: any) => {
    stats.taxaMediaFaixa1e2 = stats.taxas.length > 0
      ? stats.taxas.reduce((a: number, b: number) => a + b, 0) / stats.taxas.length
      : 0
    stats.taxaFaixa1Media = stats.populacaoTotal > 0
      ? (stats.faixa1Total / stats.populacaoTotal) * 100
      : 0
  })

  return {
    type: "FeatureCollection",
    features: bacias.features.map((bacia: any) => {
      const baciaNome = bacia.properties?.regiao
      const stats = estatisticasPorBacia[baciaNome] || {
        municipios: 0,
        populacaoTotal: 0,
        taxaMediaFaixa1e2: 0,
        faixa1Total: 0,
        faixa1e2Total: 0,
      }

      return {
        ...bacia,
        properties: {
          ...bacia.properties,
          municipios: stats.municipios,
          populacaoTotal: stats.populacaoTotal,
          taxaMediaFaixa1e2: stats.taxaMediaFaixa1e2,
          faixa1Total: stats.faixa1Total,
          faixa1e2Total: stats.faixa1e2Total,
        },
      }
    }),
  }
}
