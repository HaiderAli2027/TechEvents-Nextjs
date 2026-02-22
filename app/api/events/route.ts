import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";


export async function POST(req: NextRequest){
    try{
        await connectDB();

        const formData = await req.formData();

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        }
        catch(e){
            return NextResponse.json({ message: "Invalid Json format data" }, { status: 400 });
        }
        
        const file = formData.get("image") as File;
        
        if (!file) return NextResponse.json({ message: "Image file is required"}, { status: 400})
        
        let tags = JSON.parse(formData.get("tags") as string);
        let agenda = JSON.parse(formData.get("agenda") as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image", folder: "TechEvents" }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }            
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags:tags,
            agenda:agenda
        });


        return NextResponse.json({
            message: "Event created successfully",
            event: createdEvent
        },{ status: 201 });


    }
    catch(e){
        console.log(e);
        return NextResponse.json({
            message: "Event creation failed",
            error: e instanceof Error ? e.message : "Unknown error"},{status: 500,}
        )
    }
}

export async function GET(){
    try{
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 }).lean();

        // Convert _id and date fields to string for serialization
        const plainEvents = events.map(event => ({
            ...event,
            _id: event._id?.toString?.() ?? event._id,
            createdAt: event.createdAt?.toString?.() ?? event.createdAt,
            updatedAt: event.updatedAt?.toString?.() ?? event.updatedAt,
        }));

        return NextResponse.json({
            message: "Events fetched successfully",
            events: plainEvents
        }, { status: 200 });
    }
    catch(e){
        return NextResponse.json({ message: "Event Fetch Failed", error: e instanceof Error ? e.message : "Unknown error"}, { status: 500 });
    }
}