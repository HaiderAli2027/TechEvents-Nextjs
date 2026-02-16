export type EventItem = {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

export const events: EventItem[] = [
  {
    title: "React Summit 2024",
    image: "/images/event1.png",
    slug: "react-summit-2024",
    location: "Amsterdam, Netherlands",
    date: "June 14-15, 2024",
    time: "09:00 AM - 05:00 PM",
  },
  {
    title: "Next.js Conf 2024",
    image: "/images/event2.png",
    slug: "nextjs-conf-2024",
    location: "San Francisco, USA",
    date: "October 16-17, 2024",
    time: "09:00 AM - 05:00 PM",
  },
  {
    title: "DevOps Days NYC",
    image: "/images/event3.png",
    slug: "devops-days-nyc",
    location: "New York, USA",
    date: "September 9-10, 2024",
    time: "08:30 AM - 04:30 PM",
  },
  {
    title: "JavaScript Jam",
    image: "/images/event4.png",
    slug: "javascript-jam",
    location: "London, UK",
    date: "July 25-26, 2024",
    time: "10:00 AM - 06:00 PM",
  },
  {
    title: "Web Summit 2024",
    image: "/images/event5.png",
    slug: "web-summit-2024",
    location: "Lisbon, Portugal",
    date: "November 11-13, 2024",
    time: "09:00 AM - 05:00 PM",
  },
  {
    title: "AI & Tech Conference",
    image: "/images/event6.png",
    slug: "ai-tech-conference",
    location: "San Francisco, USA",
    date: "May 20-22, 2024",
    time: "09:00 AM - 05:00 PM",
  },
];
