import { HomePage } from "@/pages/HomePage"
import { MembersPage } from "@/pages/MembersPage"
import { PublicationsPage } from "@/pages/PublicationsPage"
import { EventPage } from "@/pages/EventPage"
import { NotFoundPage } from "@/pages/404Page"

export const publicRoutes = [
	{
		index: true,
		element: <HomePage />,
	},
	{
		path: "atividades",
		children: [
			{
				path: ":slug",
				element: <EventPage />,
			},

		],
	},
	{
		path: "publicacoes",
		element: <PublicationsPage />,
	},
	{
		path: "linhas",
		children: [
			{
				path: "previsoes",
				element: <HomePage />,
			},
			{
				path: "desastres",
				element: <HomePage />,
			},
		],
	},
	{
		path: "equipe",
		element: <MembersPage />,
	},
	{
		path: "*",
		element: <NotFoundPage />,
	},
]
