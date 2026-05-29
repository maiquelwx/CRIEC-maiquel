import { CalendarDays, MapPin } from "lucide-react"
import { AddToCalendarButton } from "add-to-calendar-button-react"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog"

interface Session {
	title: string
	date: string // ISO 8601 string
	location: string // Local "Informal" (ex: Anfiteatro)
	address: string // Endereço completo
	image?: string
	tag?: number
	description?: string
	coordinators?: string[]
}

const tagVariants = [
	"outline-1",
	"outline-2",
	"outline-3",
	"outline-4",
	"outline-5",
] as const

function SessionCard({
	session,
	eventTags,
}: {
	session: Session
	eventTags?: string[]
}) {
	const responsavelLabel =
		session.coordinators?.length === 1 ? "Responsável:" : "Responsáveis:"
	const ISOdate = new Date(session.date)
	const tagIndex = session.tag ?? 0
	const tagLabel = eventTags?.[tagIndex]
	const tagVariant = tagVariants[tagIndex % tagVariants.length] ?? "outline"

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Card className="cursor-pointer gap-2 transition-all hover:-translate-y-1 hover:shadow-sm">
					<CardHeader>
						<span className="inline-flex items-center gap-1 text-lg text-muted-foreground">
							<CalendarDays data-icon="inline-start" className="size-4.5" />
							{ISOdate.toLocaleDateString("pt-BR", {
								day: "2-digit",
								month: "2-digit",
							})}
						</span>
						{tagLabel && (
							<CardAction>
								<Badge variant={tagVariant}>{tagLabel}</Badge>
							</CardAction>
						)}
					</CardHeader>

					<CardContent>
						<CardTitle className="text-lg">{session.title}</CardTitle>
					</CardContent>

					<CardFooter className="text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<MapPin className="size-4" />
							{session.location}
						</span>
					</CardFooter>
				</Card>
			</DialogTrigger>

			<DialogContent className="max-w-lg lg:max-w-xl">
				<DialogHeader>
					<DialogTitle>{session.title}</DialogTitle>
				</DialogHeader>
				<div>
					<DialogDescription>
						<div className="text-md space-y-4">
							<div>
								<p className="font-semibold text-foreground">Data:</p>
								<p>
									{ISOdate.toLocaleString("pt-BR", {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div>
								<p className="font-semibold text-foreground">Endereço:</p>
								<p>{session.address}</p>
							</div>
							{session.description && (
								<div>
									<p className="font-semibold text-foreground">Descrição:</p>
									<p>{session.description}</p>
								</div>
							)}
							{session.coordinators && session.coordinators.length > 0 && (
								<div>
									<p className="font-semibold text-foreground">
										{responsavelLabel}
									</p>
									<ul className="list-inside list-disc">
										{session.coordinators.map((coordinator) => (
											<li key={coordinator}>{coordinator}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</DialogDescription>
				</div>

				<DialogFooter>
					<div className="mx-auto">
						<AddToCalendarButton
							name={session.title}
							description={session.description}
							// A suécia formata a data de uma forma conveniente.
							// O botão não corrige fuso, então se tentar corrigir vai dar errado
							// Deixar assim funciona!
							startDate={ISOdate.toLocaleString("sv-SE").replace(" ", "T")}
							timeZone="currentBrowser"
							location={session.address}
							label="Adicionar à Agenda"
							buttonStyle="simple"
							listStyle="dropup-static"
							lightMode="bodyScheme"
							pastDateHandling="disable"
							hideBranding
							hideBackground
							options={[
								"Google",
								"Apple",
								"iCal",
								"Outlook.com",
								"Microsoft365",
								"MicrosoftTeams",
								"Yahoo",
							]}
						/>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default SessionCard
