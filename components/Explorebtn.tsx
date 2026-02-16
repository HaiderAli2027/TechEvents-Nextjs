"use client";

import posthog from "posthog-js";

const Explorebtn = () => {
  const handleClick = () => {
    posthog.capture("explore_events_clicked", {
      button_location: "hero_section",
    });
  };

  return (
    <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={handleClick}>

        <a href="#events">Explore Events
            <img src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
        </a>
    </button>
  )
}

export default Explorebtn
