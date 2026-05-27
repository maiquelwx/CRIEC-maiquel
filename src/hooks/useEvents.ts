import events from "@/data/events.json"

interface UseEventsOptions {
	featured?: boolean
}

export function useEvents(options?: UseEventsOptions) {
	if (options?.featured) {
		return events.filter((event) => event.featured)
	}

	return events
}

/*
import { useEffect, useState } from "react"

export function useEvents() {
	const [events, setEvents] = useState([])

	useEffect(() => {
		fetch("/api/events")
			.then((res) => res.json())
			.then(setEvents)
	}, [])

	return events
}
*/

/*
export function useEvents() {
	return useQuery({
		queryKey: ["events", options],
		queryFn: () => fetchEvents(options),
	})
}
*/