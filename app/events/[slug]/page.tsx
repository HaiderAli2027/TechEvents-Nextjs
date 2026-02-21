import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)
const EventAgenda = ({agendaItems}: {agendaItems: string[] | string}) => {
    // Handle both array and stringified array
    const items = typeof agendaItems === 'string' ? JSON.parse(agendaItems) : agendaItems;
    
    return (
        <div className="agenda">
            <h2>Event Agenda</h2>
            <ul>
                {Array.isArray(items) && items.map((item: string, index: number) =>(
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

const EventTags = ({tags}: {tags: string[] | string}) => {
    // Handle both array and stringified array
    const tagList = typeof tags === 'string' ? JSON.parse(tags) : tags;
    
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {Array.isArray(tagList) && tagList.map((tag: string) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    );
}
const EventDetailsPage = async ({params}: {params: Promise<{ slug: string }>}) => {
    const { slug } = await params;
    
    try {
        const response = await fetch(`${BaseUrl}/api/events/${slug}`, {
            cache: "no-store"
        });
        
        if (!response.ok) {
            return notFound();
        }
        
        const {data: {description, image, overview, date, time, location, mode, agenda, audience, tags, organizer}} = await response.json();

        if(!description) return notFound();

        const bookings = 10;

        return (
            <section id="event">
                <div className="header">
                    <h1>Event Description</h1>
                    <p>{description}</p>
                </div>
                <div className="details">
                    {/* Left Side Event Content */}
                    <div className="content">
                        <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
                    
                        <section className="flex-col-gap-2">
                            <h2>Overview</h2>
                            <p>{overview}</p>

                        </section>
                        <section className="flex-col-gap-2">
                            
                            <h2>Event Details</h2>
                            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />

                            
                        </section>

                        <EventAgenda agendaItems={Array.isArray(agenda) ? agenda : []}/>

                        <section className="flex-col-gap-2">
                            <h2>About the Organizer</h2>
                            <p>{organizer}</p>
                        </section>

                        <EventTags tags={tags} />
                    </div>
                    {/* Right side- Booking Form */}
                    <aside className="booking">
                       <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked for this event. Don't miss out on an amazing experience!
                            </p>
                        ) : (
                            <p className="text-sm">
                                Be the first to book for this event and secure your spot!
                            </p>
                        )}
                        <BookEvent />
                       </div>
                    </aside>
                </div>
            </section>
        )
    } catch (error) {
        console.error("Error fetching event:", error);
        return notFound();
    }
}

export default EventDetailsPage
