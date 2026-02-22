import Explorebtn from '@/components/Explorebtn'
import EventCard from '@/components/EventCard'
import { IEvent } from '@/database';
import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

// Loading skeleton for events
const EventsLoadingSkeleton = () => (
  <div className='space-y-4'>
    {[1, 2, 3].map(i => (
      <div key={i} className='h-64 bg-gray-700 rounded-lg animate-pulse' />
    ))}
  </div>
);

// Fetch events directly from database (server-side)
async function FeaturedEvents() {
  try {
    // Connect to MongoDB directly
    await connectDB();
    
    // Fetch events from database
    const events = await Event.find()
      .select('title slug image date time location mode description overview tags')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
    
    // Convert ObjectIds to strings for serialization
    const plainEvents = events.map((event: any) => ({
      ...event,
      _id: event._id?.toString?.() ?? event._id,
      createdAt: event.createdAt?.toString?.() ?? event.createdAt,
      updatedAt: event.updatedAt?.toString?.() ?? event.updatedAt,
    }));

    return (
      <ul className='events'>
        {plainEvents && plainEvents.length > 0 ? (
          plainEvents.map((event: IEvent) => (
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
