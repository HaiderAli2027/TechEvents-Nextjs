import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

// Type definitions
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches event details by slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params to unwrap the Promise
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    // Trim and validate slug format
    const trimmedSlug = slug.trim().toLowerCase();

    if (trimmedSlug.length === 0) {
      return NextResponse.json(
        { message: "Slug cannot be empty" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug: trimmedSlug }).lean<IEvent>();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Convert _id and date fields to string for serialization
    const plainEvent = {
      ...event,
      _id: event._id?.toString?.() ?? event._id,
      createdAt: event.createdAt?.toString?.() ?? event.createdAt,
      updatedAt: event.updatedAt?.toString?.() ?? event.updatedAt,
    };

    return NextResponse.json(
      {
        message: "Event retrieved successfully",
        data: plainEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/events/[slug] error:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.message.includes("Cast to ObjectId")) {
      return NextResponse.json(
        { message: "Invalid event reference" },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        message: "Failed to retrieve event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
