import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

const defaultMD: Components = {
	a: ({ node, ...props }) => (
		<a
			{...props}
			target="_blank"
			rel="noopener"
			className="text-accent underline-offset-2 hover:underline hover:bg-accent-foreground/15"
		/>
	),

	h1: ({ node, ...props }) => (
		<h1
			className="mb-8 text-4xl font-bold tracking-tight"
			{...props}
		/>
	),

	h2: ({ node, ...props }) => (
		<h2
			className="mt-10 mb-4 text-2xl font-semibold tracking-tight border-b border-primary pb-2"
			{...props}
		/>
	),

	h3: ({ node, ...props }) => (
		<h3
			className="mt-8 mb-3 text-xl font-semibold"
			{...props}
		/>
	),

	p: ({ node, ...props }) => (
		<p
			className="mb-4 leading-relaxed indent-6"
			{...props}
		/>
	),

	ul: ({ node, ...props }) => (
		<ul
			className="mb-4 ml-6 list-disc space-y-2"
			{...props}
		/>
	),

	ol: ({ node, ...props }) => (
		<ol
			className="mb-4 ml-6 list-decimal space-y-2"
			{...props}
		/>
	),

	li: ({ node, ...props }) => (
		<li className="leading-7" {...props} />
	),

	strong: ({ node, ...props }) => (
		<strong className="font-semibold text-foreground" {...props} />
	),
};

type Variant = "default";

const variantComponentMD: Record<Variant, Components> = {
	default: defaultMD,
};

type MarkdownProps = React.ComponentPropsWithoutRef<typeof ReactMarkdown> & {
	className?: string;
	variant?: Variant;
};

function Markdown({ className, variant = "default", ...props }: MarkdownProps) {
	const components = variantComponentMD[variant] ?? variantComponentMD.default;

	return (
		<div className={cn("text-sm leading-relaxed lg:text-base", className)}>
			<ReactMarkdown components={components} {...props} />
		</div>
	);
}

export default Markdown;