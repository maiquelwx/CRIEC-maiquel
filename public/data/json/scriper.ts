const BASE = "https://iede.rs.gov.br/server/rest/services"

type ResultadoFinal = {
  service: string
  folder: string
  layerId: number
  layerName: string
  url: string
}

async function testarFeatureServer(serviceName: string, url: string, folder: string) {
  try {
    const res = await fetch(`${url}?f=json`)
    const json = await res.json()

    console.log("   🔎 FeatureServer:", serviceName)

    if (!json.layers) return []

    const layers: ResultadoFinal[] = json.layers.map((layer: any) => ({
      service: serviceName,
      folder,
      layerId: layer.id,
      layerName: layer.name,
      url: `${url}/${layer.id}/query?where=1=1&outFields=*&f=geojson`,
    }))

    console.log(`   ✅ ${layers.length} layers encontrados`)
    return layers
  } catch (e) {
    console.log("   ❌ erro:", serviceName)
    return []
  }
}

async function run() {
  console.log("Iniciando...\n")

  const root = await fetch(`${BASE}?f=json`).then((r) => r.json())

  const resultados: ResultadoFinal[] = []

  console.log("Folders:", root.folders.length)

  for (const folder of root.folders) {
    console.log(`\n📁 Folder: ${folder}`)

    let folderJson
    try {
      folderJson = await fetch(`${BASE}/${folder}?f=json`).then((r) =>
        r.json()
      )
    } catch {
      console.log("   ❌ erro no folder")
      continue
    }

    const services = folderJson.services || []
    console.log("   services:", services.length)

    for (const s of services) {
      if (s.type !== "FeatureServer") continue

      const url = `${BASE}/${folder}/${s.name}/FeatureServer`

      const layers = await testarFeatureServer(s.name, url, folder)

      resultados.push(...layers)
    }
  }

  console.log("\n==============================")
  console.log("🎯 TOTAL GEOJSON ENDPOINTS:", resultados.length)
  console.log("==============================\n")

  console.log(resultados)

  // salva arquivo final limpo
  await import("fs").then((fs) => {
    fs.writeFileSync(
      "geojson_catalogo.json",
      JSON.stringify(resultados, null, 2)
    )
  })

  console.log("\n💾 salvo em geojson_catalogo.json")
}

run()