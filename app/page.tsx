import Explorebtn from '@/components/Explorebtn'
import EventCard from '@/components/EventCard'
import { events } from '@/lib/constants'
import { IEvent } from '@/database';

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  
  const response = await fetch(`${BaseUrl}/api/events`);
  const { events} = await response.json();
  
  return (
    <div>
      <section>
        <h1 className='text-center '>The Hub for Every Dev <br/> Event You Can't Miss</h1>
        <p className='text-center mt-5'>Hackathons, Meetups, and Conferences, All in one Place!</p>

        <Explorebtn/>

        <div className='mt-20 space-y-7'>
          <h3>Featured Events</h3>   
          <ul className='events'>
            {events && events.length > 0 &&events.map((event: IEvent) => (
              <li key={event.title}>
                
                {/* rest operator used */}
                <EventCard {...event}/>
                </li>
              ))}
              
          </ul>
        </div>

      </section>
    </div>
  )
}

export default page
