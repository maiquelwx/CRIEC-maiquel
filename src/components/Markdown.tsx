import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import type { Components } from "react-markdown"

const defaultMD: Components = {
	a: (props) => (
		<a
			{...props}
			target="_blank"
			rel="noopener"
			className="text-accent underline-offset-2 hover:bg-accent-foreground/15 hover:underline"
		/>
	),

	h1: (props) => (
		<h1 className="mb-8 text-4xl font-bold tracking-tight" {...props} />
	),

	h2: (props) => (
		<h2
			className="mt-10 mb-4 border-b border-primary pb-2 text-2xl font-semibold tracking-tight"
			{...props}
		/>
	),

	h3: (props) => <h3 className="mt-8 mb-3 text-xl font-semibold" {...props} />,

	p: (props) => <p className="mb-4 indent-6 leading-relaxed" {...props} />,

	ul: (props) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,

	ol: (props) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,

	li: (props) => <li className="leading-7" {...props} />,

	strong: (props) => (
		<strong className="font-semibold text-foreground" {...props} />
	),
}

type Variant = "default"

const variantComponentMD: Record<Variant, Components> = {
	default: defaultMD,
}

type MarkdownProps = React.ComponentPropsWithoutRef<typeof ReactMarkdown> & {
	className?: string
	variant?: Variant
}

function Markdown({ className, variant = "default", ...props }: MarkdownProps) {
	const components = variantComponentMD[variant] ?? variantComponentMD.default

	return (
		<div className={cn("text-sm leading-relaxed lg:text-base", className)}>
			<ReactMarkdown components={components} {...props} />
		</div>
	)
}

export default Markdown
