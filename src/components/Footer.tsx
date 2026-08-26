import { Link } from "react-router-dom"
import { Mail, Phone, MapPin } from "lucide-react"
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa"
import { Separator } from "@/components/ui/separator"
import partners from "@/data/partners.json"

function Footer() {
	const currentYear = new Date().getFullYear()

	// TODO: Ajustar links de navegação e organizar melhor as rotas
	const navigationLinks = [
		{ label: "Home", to: "/" },
		{ label: "Atividades", to: "/atividades" },
		{ label: "Publicações", to: "/publicacoes" },
		{ label: "Equipe", to: "/equipe" },
	]
	void navigationLinks

	const socialLinks = [
		{ icon: FaGithub, label: "GitHub", href: "#" },
		{ icon: FaInstagram, label: "Instagram", href: "#" },
		{ icon: FaLinkedin, label: "LinkedIn", href: "#" },
		{ icon: FaYoutube, label: "YouTube", href: "#" },
	]

	const contactItems = [
		{
			icon: Mail,
			label: "contato@criec.edu.br",
			href: "mailto:contato@criec.edu.br",
		},
		{
			icon: Phone,
			label: "+55 (53) 99999-9999",
			href: "tel:+5553999999999",
		},
		{
			icon: MapPin,
			label: "Av. Bento Gonçalves, 9500 - Agronomia, Porto Alegre - RS",
			href: "https://maps.app.goo.gl/yDipyCXj2QjMVBZZ7",
		},
	]

	const legalLinks = [
		{ label: "Termos de Serviço", to: "/legal/termos" },
		{ label: "Política de Privacidade", to: "/legal/privacidade" },
		{ label: "Política de Cookies", to: "/legal/cookies" },
	]

	{
		/* INICIO REMOVER */
	}
	const temporaryPageLinks = [
		{ label: "Design System", path: "/design-system" },
		{ label: "404", path: "/rota-inexistente" },
		{ label: "Route Error", path: "/design-system?triggerRouteError=true" },
	]
	void temporaryPageLinks
	{
		/* FIM REMOVER */
	}

	const linkClass =
		"text-sm text-muted-foreground transition-colors hover:text-foreground"

	return (
		<footer className="mt-16 border-t border-border/60 bg-background">
			<div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
				{/* Main Footer Content */}
				<div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
					{/* Logo Section */}
					<div className="flex max-w-xs flex-col gap-4">
						<div className="flex items-center gap-2">
							<img src="/Logo-solido.svg" alt="CRIEC" className="h-8 w-8" />
							<p className="font-heading text-base font-semibold tracking-tight">
								CRIEC
							</p>
						</div>
						<p className="text-sm text-muted-foreground">
							Centro de Referência Internacional em Estudos Relacionados às
							Mudanças Climáticas
						</p>
						{/* Social Links */}
						<div className="flex flex-wrap gap-3">
							{socialLinks.map(({ icon: Icon, label, href }) => (
								<a
									key={label}
									href={href}
									className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted"
									aria-label={`Acessar ${label}`}
								>
									<Icon className="size-4" />
								</a>
							))}
						</div>
					</div>

					{/* Navigation Links */}
					{/* 					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-semibold">Navegação</h3>
						<ul className="space-y-2">
							{navigationLinks.map((link) => (
								<li key={link.to}>
									<Link
										to={link.to}
										className={linkClass}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
						<div className="pt-1">
							<p className="mb-2 text-xs text-muted-foreground">
								Atalhos temporários
							</p>
							<ul className="space-y-2">
								{temporaryPageLinks.map((link) => (
									<li key={link.path}>
										<Link
											to={link.path}
											className={linkClass}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div> */}

					{/* Contact */}
					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-semibold">Contato</h3>
						<ul className="space-y-4">
							{contactItems.map(({ icon: Icon, label, href }) => (
								<li key={label} className="flex items-start gap-2">
									<Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
									<a
										href={href}
										target="_blank"
										rel="noreferrer noopener"
										className={linkClass}
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Partners */}
					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-semibold">Parceiros</h3>
						<ul className="grid grid-cols-2 gap-x-4 gap-y-2">
							{partners.map((partner) => (
								<li key={partner.name}>
									<a
										href={partner.website}
										target="_blank"
										rel="noreferrer noopener"
										className={linkClass}
										title={partner.name}
									>
										{partner.name}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Legal */}
					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-semibold">Legal</h3>
						<ul className="space-y-2">
							{legalLinks.map((item) => (
								<li key={item.to}>
									<Link to={item.to} className={linkClass}>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Divider */}
				<Separator />

				{/* Bottom Footer */}
				<div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
					<p className="text-xs text-muted-foreground">
						© {currentYear} CRIEC. Todos os direitos reservados.
					</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer
