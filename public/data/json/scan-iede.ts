import fs from "fs"

const BASE = "https://iede.rs.gov.br/server/rest/services"
const OUTFILE = "geojson_catalogo.json"

type Resultado = {
  folder: string | null
  service: string
  url: string
}

// carrega progresso anterior (se existir)
let resultados: Resultado[] = []
if (fs.existsSync(OUTFILE)) {
  try {
    resultados = JSON.parse(fs.readFileSync(OUTFILE, "utf-8"))
    console.log(`♻️ retomando com ${resultados.length} registros já salvos`)
  } catch {}
}

async function fetchJSON(url: string) {
  try {
    const res = await fetch(url)
    const text = await res.text()
    if (!text.trim().startsWith("{")) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

// salva sempre que quiser (segurança contra crash)
function save() {
  fs.writeFileSync(OUTFILE, JSON.stringify(resultados, null, 2))
}

async function listar() {
  console.log("🚀 Iniciando scan IEDE...\n")

  const root = await fetchJSON(`${BASE}?f=json`)
  if (!root) throw new Error("Falha root")

  const folders = root.folders || []
  console.log(`📂 Pastas: ${folders.length}\n`)

  for (const folder of folders) {
    console.log(`🔹 Folder: ${folder}`)

    const folderData = await fetchJSON(`${BASE}/${folder}?f=json`)
    if (!folderData?.services) continue

    const services = folderData.services
    console.log(`   Serviços: ${services.length}`)

    for (const s of services) {
      if (!s.name || s.type !== "FeatureServer") continue

      const url = `${BASE}/${s.name}/FeatureServer`
      const test = await fetchJSON(`${url}?f=json`)

      if (test?.layers) {
        console.log(`      ✅ ${s.name}`)

        resultados.push({
          folder,
          service: s.name,
          url: `${url}/0/query?where=1=1&outFields=*&f=geojson`,
        })

        // 🔥 salva incrementalmente
        save()
      }
    }
  }

  console.log("\n🎯 FINALIZADO")
  console.log(`Total: ${resultados.length}`)
  save()
}

listar()