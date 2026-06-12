import type { FeatureCollection } from "geojson"
import { CAMADAS_DISPONIVEIS } from "@/services/dataService"

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

const isNumber = (value: any): value is number =>
  typeof value === "number" && Number.isFinite(value)

const averageCoordinates = (coords: [number, number][]) => {
  const total = coords.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 }
  )
  return [total.lng / coords.length, total.lat / coords.length] as [number, number]
}

const flattenCoordinates = (coords: any): [number, number][] => {
  if (!Array.isArray(coords)) return []
  if (isNumber(coords[0]) && isNumber(coords[1])) {
    return [coords as [number, number]]
  }
  return coords.flatMap((c: any) => flattenCoordinates(c))
}

export const getFeatureCentroid = (feature: any): [number, number] | null => {
  const coords = feature?.geometry?.coordinates
  if (!coords) return null

  const points = flattenCoordinates(coords)
  if (points.length === 0) return null
  return averageCoordinates(points)
}

const coordsEqual = (a: any, b: any): boolean => {
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    return a.every((item, index) => coordsEqual(item, b[index]))
  }
  return a === b
}

const pointToString = (coords: any) => JSON.stringify(coords)

const getFeatureArea = (feature: any): number => {
  const coords = feature?.geometry?.coordinates
  if (!coords) return 0

  const ringArea = (ring: [number, number][]) => {
    let area = 0
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, y1] = ring[i]
      const [x2, y2] = ring[j]
      area += x1 * y2 - x2 * y1
    }
    return Math.abs(area) / 2
  }

  const areaFromCoords = (c: any): number => {
    if (!Array.isArray(c)) return 0
    if (isNumber(c[0]) && isNumber(c[1])) return 0
    if (Array.isArray(c[0]) && isNumber(c[0][0])) {
      return ringArea(c as [number, number][])
    }
    return c.reduce((sum: number, item: any) => sum + areaFromCoords(item), 0)
  }

  return areaFromCoords(coords)
}

const featureContainsFeature = (container: any, subject: any): boolean => {
  const containerGeom = container?.geometry?.type
  const point = getFeatureCentroid(subject)
  if (!point) return false

  if (containerGeom === "Polygon" || containerGeom === "MultiPolygon") {
    return pointInPolygon(point, container.geometry.coordinates)
  }

  return false
}

const mergeProperties = (base: any, extra: any, prefix: string) => {
  const result = { ...base }
  Object.entries(extra || {}).forEach(([key, value]) => {
    if (result[key] === undefined) {
      result[key] = value
    } else {
      result[`${prefix}_${key}`] = value
    }
  })
  return result
}

const summarizeContainedFeatures = (features: any[], labelKey: string) => {
  const labels = features
    .map((feature) => feature.properties?.[labelKey] || feature.properties?.name || feature.properties?.Nome || feature.properties?.nome)
    .filter(Boolean)
    .slice(0, 5)
  return labels.length > 0 ? labels : undefined
}

export const combineAreaArea = (
  areaA: FeatureCollection,
  areaB: FeatureCollection,
  idA: string,
  idB: string
): { combined: FeatureCollection; primaryId: string } | null => {
  const areaAValue = areaA.features.reduce((sum, f: any) => sum + getFeatureArea(f), 0)
  const areaBValue = areaB.features.reduce((sum, f: any) => sum + getFeatureArea(f), 0)

  const baseCollection = areaAValue >= areaBValue ? areaA : areaB
  const overlayCollection = areaAValue >= areaBValue ? areaB : areaA
  const baseId = areaAValue >= areaBValue ? idA : idB
  const overlayId = baseId === idA ? idB : idA

  const overlayPoints = overlayCollection.features
    .map((feature: any) => ({ feature, centroid: getFeatureCentroid(feature) }))
    .filter((item) => item.centroid !== null)

  const combined: FeatureCollection = {
    type: "FeatureCollection",
    features: baseCollection.features.map((baseFeature: any) => {
      const contained = overlayPoints.filter((item) => featureContainsFeature(baseFeature, item.feature))
      const mergedProperties = {
        ...baseFeature.properties,
        [`${overlayId}_count`]: contained.length,
      }
      if (contained.length > 0) {
        const summary = summarizeContainedFeatures(contained.map((item) => item.feature), "name")
        if (summary) {
          mergedProperties[`${overlayId}_summary`] = summary.join(", ")
        }
      }
      return {
        ...baseFeature,
        properties: mergedProperties,
      }
    }),
  }

  return combined.features.length > 0 ? { combined, primaryId: baseId } : null
}

export const combineAreaPoint = (
  areaLayer: FeatureCollection,
  pointLayer: FeatureCollection,
  areaId: string,
  pointId: string
): { combined: FeatureCollection; primaryId: string } | null => {
  const pointItems = pointLayer.features.map((feature: any) => ({ feature, coord: feature?.geometry?.coordinates }))

  const combined: FeatureCollection = {
    type: "FeatureCollection",
    features: areaLayer.features.map((areaFeature: any) => {
      const containedPoints = pointItems.filter((item) =>
        item.coord && featureContainsFeature(areaFeature, { geometry: { type: "Point", coordinates: item.coord } })
      )
      const mergedProperties = {
        ...areaFeature.properties,
        [`${pointId}_count`]: containedPoints.length,
      }
      if (containedPoints.length > 0) {
        const summary = summarizeContainedFeatures(containedPoints.map((item) => item.feature), "name")
        if (summary) {
          mergedProperties[`${pointId}_summary`] = summary.join(", ")
        }
      }
      return {
        ...areaFeature,
        properties: mergedProperties,
      }
    }),
  }

  return combined.features.length > 0 ? { combined, primaryId: areaId } : null
}

export const combinePointPoint = (
  pointA: FeatureCollection,
  pointB: FeatureCollection,
  idA: string,
  idB: string
): { combined: FeatureCollection; primaryId: string } | null => {
  const pointBMap = new Map<string, any>()
  pointB.features.forEach((feature: any) => {
    const key = pointToString(feature?.geometry?.coordinates)
    if (key) {
      pointBMap.set(key, feature)
    }
  })

  const mergedFeatures = pointA.features.map((featureA: any) => {
    const key = pointToString(featureA?.geometry?.coordinates)
    const featureB = pointBMap.get(key)
    if (featureB) {
      pointBMap.delete(key)
      return {
        ...featureA,
        properties: mergeProperties(featureA.properties, featureB.properties, idB),
      }
    }
    return featureA
  })

  const leftovers = Array.from(pointBMap.values())
  const combined: FeatureCollection = {
    type: "FeatureCollection",
    features: [...mergedFeatures, ...leftovers],
  }

  return combined.features.length > 0 ? { combined, primaryId: idA } : null
}

export const combineTwoLayers = (
  idA: string,
  idB: string,
  layerA: FeatureCollection,
  layerB: FeatureCollection
): { combined: FeatureCollection; primaryId: string } | null => {
  const typeA = CAMADAS_DISPONIVEIS[idA]?.geometry || "desconhecido"
  const typeB = CAMADAS_DISPONIVEIS[idB]?.geometry || "desconhecido"

  if (typeA === "area" && typeB === "area") {
    return combineAreaArea(layerA, layerB, idA, idB)
  }

  if (typeA === "area" && typeB === "ponto") {
    return combineAreaPoint(layerA, layerB, idA, idB)
  }

  if (typeA === "ponto" && typeB === "area") {
    return combineAreaPoint(layerB, layerA, idB, idA)
  }

  if (typeA === "ponto" && typeB === "ponto") {
    return combinePointPoint(layerA, layerB, idA, idB)
  }

  return null
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
