import sharp from "sharp"
import fs from "fs/promises"
import path from "path"

const input = process.argv[2]
const size = Number(process.argv[3])

const stat = await fs.stat(input)

if (!stat.isFile() && !stat.isDirectory()) {
	throw new Error("Invalid input")
}

if (!Number.isInteger(size) || size <= 0) {
	throw new Error("Invalid size")
}

// Verifica se input é arquivo ou diretório
// Mapeia os caminhos de acordo
const files = stat.isFile()
	? [input]
	: (await fs.readdir(input)).map((file) => path.join(input, file))

const outputDirectory = path.join(input, "processed")
await fs.mkdir(outputDirectory)

for (const file of files) {
	const filename = path.parse(file).name
	const outputFile = path.join(outputDirectory, `${filename}.webp`)

	console.log(`Processing ${file}`)

	await sharp(file)
		.rotate()
		.toColorspace("srgb")
		.resize({
			width: size,
			height: size,
			fit: "inside",
			withoutEnlargement: true,
		})
		.sharpen()
		.webp({
			quality: 85,
			effort: 6,
		})
		.toFile(outputFile)
}
