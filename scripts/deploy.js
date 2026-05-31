/**
 * - verifica estado do repositório
 * - interrompe e sai se tiverem modificações unstaged
 * - verifica versão, tags e commits
 * - se HEAD tag existe e é != versão interrompe e sai
 * - vai pra branch prod
 * - realiza squash merge, agrupando commits
 * - commita o merge e faz o push
 * - volra pra branch main
 */

import { execSync } from "node:child_process"
import fs from "node:fs"

/**
 * Wrapper git para retornar string.
 */
function git(command) {
	return execSync(`git ${command}`, {
		encoding: "utf-8",
	}).trim()
}

/**
 * Verifica se existem alterações unstaged.
 *
 * Alterações unstaged interrompem o deploy,
 * porque podem indicar arquivos parcialmente editados
 * ou mudanças ainda não preparadas.
 */
try {
	git("diff --quiet")
} catch {
	console.error("\n✗ Deploy cancelado: existem alterações unstaged.\n")

	process.exit(1)
}

/**
 * Verifica se existem alterações staged.
 *
 * Alterações staged NÃO interrompem o deploy.
 * O script apenas avisa que elas existem.
 *
 * O deploy continuará usando apenas o estado
 * commitado da branch main.
 */
try {
	git("diff --cached --quiet")
} catch {
	console.warn(
		"\n⚠ Existem alterações staged. O deploy continuará usando apenas o estado commitado da branch main.\n"
	)
}

// Lê a versão atual do pacote
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))

const version = packageJson.version

// hash curto do HEAD
const currentHash = git("rev-parse --short HEAD")
// tag atual do HEAD, se existir
const currentTag = git("tag --points-at HEAD")

/**
 * Verifica se a tag atual corresponde
 * à versão declarada no package.json.
 *
 * Se existir divergência:
 * - o deploy é interrompido
 */
if (currentTag && currentTag !== `v${version}`) {
	console.error(
		`\n✗ Deploy cancelado: a tag atual (${currentTag}) não corresponde à versão(v${version}).\n`
	)

	process.exit(1)
}

/**
 * Mensagem do commit de deploy.
 *
 * Normalmente:
 * - deploy v0.2.0
 *
 * Se existirem commits depois da última versão:
 * - deploy v0.2.0 +(a1b2c3d)
 */
let deployMessage = `deploy v${version}`

if (!currentTag) {
	deployMessage += ` +(${currentHash})`
}

// Troca para a branch de produção.
git("checkout prod")

// Faz squash merge da main na prod.
git("merge --squash main")

// Cria commit de deploy.
git(`commit -m "${deployMessage}"`)

// Envia a branch prod para o remoto.
git("push origin prod")

// Volta para a branch principal.
git("checkout main")

console.log("\n✓ Deploy concluído com sucesso.\n")
