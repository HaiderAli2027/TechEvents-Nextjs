"use client";

import { useState } from "react";

const BookEvent = () => {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTimeout(() => {
            setSubmitting(true);
        }, 1000);
    }

  return (
    <div id="book-event">
        {submitting ? (
            <p className="text-sm">Thanks for Signing Up</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" placeholder="Enter your email address" />

                    <button type="submit" className="button-submit">Submit</button>
                </div>
            </form>
        )
        }
      
    </div>
  )
}

export default BookEvent
