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
			<h1 className="my-10 py-5 px-3 font-heading font-semibold text-6xl border-b-2">
				{document.title}
			</h1>
			<div className="px-10 bg-card rounded-2xl border border-ring">
				<Markdown>{document.content}</Markdown>
			</div>
		</section>
	)
}

export default LegalPage
