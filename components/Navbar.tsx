"use client";

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const Navbar = () => {
  const handleNavClick = (linkName: string) => {
    posthog.capture(`nav_${linkName}_clicked`, {
      nav_item: linkName,
    });
  };

  return (
    <header>
        <nav>
            <Link href="/" className="logo" onClick={() => handleNavClick("logo")}>
                <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

                <p>TechEvents</p>

            </Link>

            <ul>
                <Link href="/" onClick={() => handleNavClick("home")}>Home</Link>
                <Link href="/" onClick={() => handleNavClick("events")}>Events</Link>
                <Link href="/" onClick={() => handleNavClick("create_event")}>Create Events</Link>

            </ul>
        </nav>
    </header>
  )
}

export default Navbar
