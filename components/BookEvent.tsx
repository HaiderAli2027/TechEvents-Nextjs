"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setError("Email is required");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const result = await createBooking({ eventId, email });
            
            if (result.success) {
                setSubmitted(true);
                setEmail("");
                
                // Track booking with PostHog
                posthog.capture("booking_created", {
                    event_id: eventId,
                    event_slug: slug,
                    user_email: email,
                    timestamp: new Date().toISOString(),
                });
            } else {
                setError(result.error || "Failed to create booking");
                console.error("Booking failed:", result.error);
                
                // Capture error event
                posthog.capture("booking_failed", {
                    event_id: eventId,
                    error: result.error,
                    user_email: email,
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An error occurred";
            setError(errorMsg);
            console.error("Booking error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm text-center text-green-500 font-semibold">Thanks for Signing Up! Check your email.</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            id="email" 
                            placeholder="Enter your email address"
                            disabled={isLoading}
                            required
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <button 
                            type="submit" 
                            className="button-submit mt-4 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Booking..." : "Submit"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default BookEvent;
