import { useParams } from "react-router-dom"
import Markdown from "@/components/Markdown"
import { NotFoundPage } from "./404Page"
import cookiesMD from "@/data/legal/cookies.md?raw"
import privacyMD from "@/data/legal/privacidade.md?raw"
import termsMD from "@/data/legal/termos.md?raw"

const legalDocs = {
	privacidade: {
		title: "Política de Privacidade",
		content: privacyMD,
	},
	cookies: {
		title: "Política de Cookies",
		content: cookiesMD,
	},
	termos: {
		title: "Termos de Uso",
		content: termsMD,
	},
} as const

export function LegalPage() {
	const { slug } = useParams()
	const document = legalDocs[slug as keyof typeof legalDocs]

	if (!document) {
		return <NotFoundPage />
	}

	return (
		<section className="mx-auto max-w-5xl">
			<h1 className="my-10 border-b-2 px-3 py-5 font-heading text-6xl font-semibold">
				{document.title}
			</h1>
			<div className="rounded-2xl border border-ring bg-card px-10">
				<Markdown>{document.content}</Markdown>
			</div>
		</section>
	)
}

export default LegalPage
