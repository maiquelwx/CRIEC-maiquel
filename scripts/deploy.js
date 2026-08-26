/**
 * - verifica estado do repositório
 * - interrompe e sai se tiverem modificações unstaged
 * - vai pra branch prod
 * - avança prod até o estado atual da main (fast-forward)
 * - faz push para o repositório remoto
 * - volta para a branch main
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

// Troca para a branch de produção.
git("checkout prod")

// Avança a branch prod até o estado atual da main.
git("merge --ff-only main")

// Envia a branch prod para o remoto.
git("push origin prod")

// Volta para a branch principal.
git("checkout main")

console.log("\n✓ Deploy concluído com sucesso.\n")
