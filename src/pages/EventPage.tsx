import SessionCard from "@/components/SessionCard"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"
import { useParams } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import { NotFoundPage } from "./404Page"

export function EventPage() {
	const { slug } = useParams()

	const events = useEvents()
	const event = events.find((event) => event.slug === slug)

	if (!event) {
		return <NotFoundPage />
	}

	return (
		<main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-8 lg:gap-8 lg:px-6 lg:py-10">
			{/* Header */}
			<header className="flex w-full flex-col gap-4">
				<div>
					<h1 className="font-heading text-4xl font-semibold tracking-tight lg:text-5xl">
						{event.title}
					</h1>
				</div>
			</header>

			<Separator />

			{/* Content Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Left Column: Description and Images */}
				<div className="flex flex-col gap-4 lg:col-span-1">
					<div className="px-2 py-1 lg:px-3">
						<p className="text-sm leading-relaxed whitespace-pre-wrap lg:text-base">
							{event.description}
						</p>
					</div>

					{event.images && event.images.length > 0 && (
						<div className="relative px-10">
							<Carousel className="w-full" opts={{ loop: true }}>
								<CarouselContent>
									{event.images.map((image, index) => (
										<CarouselItem key={`${image}-${index}`}>
											<AspectRatio ratio={4 / 3}>
												<img
													src={image}
													alt={`${event.title} - imagem ${index + 1}`}
													className="m-auto max-h-full max-w-full rounded-2xl border object-contain"
												/>
											</AspectRatio>
										</CarouselItem>
									))}
								</CarouselContent>
								{event.images.length > 1 && (
									<>
										<CarouselPrevious className="left-2 md:-left-10" />
										<CarouselNext className="right-2 md:-right-10" />
									</>
								)}
							</Carousel>
						</div>
					)}
				</div>

				{/* Right Column: Sessions */}
				<section id="sessions" className="lg:col-span-1">
					<div className="flex h-[80svh] flex-col">
						<ScrollArea type="always" className="relative h-full w-full px-4">
							{/* Fade overlay*/}
							<div className="pointer-events-none absolute top-0 z-10 h-[5%] w-full bg-linear-to-b from-background to-transparent" />
							<div className="grid gap-4 p-0 lg:grid-cols-1 lg:pt-[5%] lg:pb-[30svh] xl:grid-cols-2">
								{event.sessions.map((session) => (
									<SessionCard
										key={session.title}
										session={session}
										eventTags={event.tags}
									/>
								))}
							</div>
							{/* Fade overlay*/}
							<div className="pointer-events-none absolute bottom-0 z-10 h-[20%] w-full bg-linear-to-t from-background to-transparent" />
						</ScrollArea>
					</div>
				</section>
			</div>
		</main>
	)
}

export default EventPage
