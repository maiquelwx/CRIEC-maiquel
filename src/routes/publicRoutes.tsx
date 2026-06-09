import { HomePage } from "@/pages/HomePage"
import { MembersPage } from "@/pages/MembersPage"
import { PublicationsPage } from "@/pages/PublicationsPage"
import { EventPage } from "@/pages/EventPage"
import { LegalPage } from "@/pages/LegalPage"
import { NotFoundPage } from "@/pages/404Page"

export const publicRoutes = [
	// Home
	{
		index: true,
		element: <HomePage />,
		handle: {
			seo: {
				title: "CRIEC | Estudos Climáticos",
				description:
					"Integrando dados meteorológicos, sociais e de desastres para mapear vulnerabilidades, identificar padrões e apoiar a resiliência climática no Rio Grande do Sul.",
			},
		},
	},
	// Eventos
	{
		path: "atividades",
		handle: {
			seo: {
				title: "Atividades | CRIEC",
				description:
					"Acompanhe eventos, projetos e atividades desenvolvidas pelo CRIEC.",
			},
		},
		children: [
			{
				index: true,
				element: <NotFoundPage />,
			},
			{
				path: ":slug",
				element: <EventPage />,
			},
		],
	},
	// Publicações
	{
		path: "publicacoes",
		element: <PublicationsPage />,
		handle: {
			seo: {
				title: "Publicações | CRIEC",
				description:
					"Artigos, relatórios e produções científicas do CRIEC sobre clima, vulnerabilidade, riscos e desastres.",
			},
		},
	},
	// Linhas de pesquisa
	{
		path: "linhas",
		children: [
			{
				index: true,
				element: <NotFoundPage />,
			},
			{
				path: "previsoes",
				element: <NotFoundPage />,
				handle: {
					seo: {
						title: "Previsões | CRIEC",
					},
				},
			},
			{
				path: "desastres",
				element: <NotFoundPage />,
				handle: {
					seo: {
						title: "Desastres | CRIEC",
					},
				},
			},
		],
	},
	// Pesquisadores
	{
		path: "equipe",
		element: <MembersPage />,
		handle: {
			seo: {
				title: "Equipe | CRIEC",
				description:
					"Conheça a equipe de pesquisadores e colaboradores do CRIEC.",
			},
		},
	},
	// Termos legais
	{
		path: "legal",
		handle: {
			seo: {
				title: "Legal | CRIEC",
				description:
					"Apresenta os termos, limitações, e políticas de uso de aplicações do CRIEC.",
			},
		},
		children: [
			{
				index: true,
				element: <NotFoundPage />,
			},
			{
				path: ":slug",
				element: <LegalPage />,
			},
		],
	},
	// 404
	{
		path: "*",
		element: <NotFoundPage />,
		handle: {
			seo: {
				title: "404 | CRIEC",
				description: "Página não encontrada.",
			},
		},
	},
]
