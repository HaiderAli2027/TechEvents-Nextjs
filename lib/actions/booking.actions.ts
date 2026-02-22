'use server';

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import { Types } from "mongoose";

export const createBooking = async ({
    eventId,
    email,
}: {
    eventId: string;
    email: string;
}) => {
    try {
        await connectDB();
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: "Invalid email format" };
        }

        // Validate and convert eventId to ObjectId
        if (!Types.ObjectId.isValid(eventId)) {
            return { success: false, error: "Invalid event ID" };
        }

        // Create booking
        const booking = await Booking.create({ 
            eventId: new Types.ObjectId(eventId),
            email: email.toLowerCase(),
        });

        // Convert to plain object for serialization
        const plainBooking = {
            _id: booking._id?.toString?.() ?? booking._id,
            eventId: booking.eventId?.toString?.() ?? booking.eventId,
            email: booking.email,
            createdAt: booking.createdAt?.toString?.() ?? booking.createdAt,
            updatedAt: booking.updatedAt?.toString?.() ?? booking.updatedAt,
        };

        return { success: true, booking: plainBooking };
    } catch (e) {
        console.error("Error creating booking:", e);
        const errorMessage = e instanceof Error ? e.message : "Failed to create booking";
        return { success: false, error: errorMessage };
    }
};