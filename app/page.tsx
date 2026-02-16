import Explorebtn from '@/components/Explorebtn'
import EventCard from '@/components/EventCard'
import { events } from '@/lib/constants'


const page = () => {
  return (
    <div>
      <section>
        <h1 className='text-center '>The Hub for Every Dev <br/> Event You Can't Miss</h1>
        <p className='text-center mt-5'>Hackathons, Meetups, and Conferences, All in one Place!</p>

        <Explorebtn/>

        <div className='mt-20 space-y-7'>
          <h3>Featured Events</h3>   
          <ul className='events'>
            {events.map((event) => (
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
