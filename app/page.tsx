import Explorebtn from '@/components/Explorebtn'
import EventCard from '@/components/EventCard'
import { IEvent } from '@/database';
import { Suspense } from 'react';

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Loading skeleton for events
const EventsLoadingSkeleton = () => (
  <div className='space-y-4'>
    {[1, 2, 3].map(i => (
      <div key={i} className='h-64 bg-gray-700 rounded-lg animate-pulse' />
    ))}
  </div>
);

// Fetch events component
async function FeaturedEvents() {
  try {
    const response = await fetch(`${BaseUrl}/api/events`, {
      cache: 'force-cache', // Enable aggressive caching
      next: { revalidate: 3600 } // Revalidate every 1 hour
    });
    
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const data = await response.json();
    const events = data.events || [];

    return (
      <ul className='events'>
        {events && events.length > 0 ? (
          events.map((event: IEvent) => (
            <li key={event._id || event.title}>
              <EventCard {...event} />
            </li>
          ))
        ) : (
          <li className='text-center py-8 text-light-100'>No events available yet</li>
        )}
      </ul>
    );
  } catch (error) {
    console.error('Failed to load featured events:', error);
    return <div className='text-red-500'>Failed to load events. Please try again later.</div>;
  }
}

const page = async () => {
  return (
    <div>
      <section>
        <h1 className='text-center'>The Hub for Every Dev <br /> Event You Can't Miss</h1>
        <p className='text-center mt-5'>Hackathons, Meetups, and Conferences, All in one Place!</p>

        <Explorebtn />

        <div className='mt-20 space-y-7'>
          <h3>Featured Events</h3>
          <Suspense fallback={<EventsLoadingSkeleton />}>
            <FeaturedEvents />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

export default page
