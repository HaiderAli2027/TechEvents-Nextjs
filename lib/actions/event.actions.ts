"use server";

import { connect } from "http2";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try{
        await connectDB();

        const event = await Event.findOne({ slug}).lean();
        
        if (!event) {
            console.warn(`Event not found: ${slug}`);
            return [];
        }

        // Safely parse tags - handle both array and string formats
        let eventTags: string[] = [];
        if (Array.isArray(event.tags)) {
            eventTags = event.tags;
        } else if (typeof event.tags === 'string') {
            try {
                eventTags = JSON.parse(event.tags);
            } catch {
                eventTags = [event.tags];
            }
        }

        console.log(`Finding similar events for ${slug} with tags:`, eventTags);

        // Query for events with matching tags, excluding current event
        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: eventTags }
        }).lean();

        console.log(`Found ${similarEvents.length} similar events`);

        // Convert Mongoose documents to plain objects
        return similarEvents.map(evt => ({
            ...evt,
            _id: evt._id?.toString?.() ?? evt._id,
            createdAt: evt.createdAt?.toString?.() ?? evt.createdAt,
            updatedAt: evt.updatedAt?.toString?.() ?? evt.updatedAt,
        }));

    }catch(e){
        console.error("Error fetching similar events:", e);
        return [];
    }
}