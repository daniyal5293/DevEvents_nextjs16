import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {v2 as cloudinary} from "cloudinary";

export async function POST(request: NextRequest) {
    try{
        await connectDB();

        let event;
        const contentType = request.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            event = await request.json();
        } else if (contentType?.includes("multipart/form-data") || contentType?.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            event = Object.fromEntries(formData.entries());
            const file = formData.get('image') as File;
        if(!file) return NextResponse.json({ message: "Image file is required", error: "Missing image file" }, { status: 400 });

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image", folder: "DevEvents" }, (error: any, result: unknown) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(new Error("Failed to upload image"));
                } else {
                    resolve(result);
                }
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;
        const createdEvent = Event.create({
            ...event,
            tags: tags,
            agenda: agenda
         });

        return NextResponse.json({ message: "Event created successfully", event: createdEvent }, { status: 201 });
    } else {
        return NextResponse.json({ message: "Content-Type must be application/json or form-data", error: "Unsupported Content-Type" }, { status: 400 });
    }

    } catch(error: any){
        console.error("Error creating event:", error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json({ 
                message: "Validation failed", 
                errors: messages,
                fieldErrors: Object.entries(error.errors).reduce((acc: any, [key, err]: any) => {
                    acc[key] = err.message;
                    return acc;
                }, {})
            }, { status: 400 });
        }

        // Handle duplicate key error (slug already exists)
        if (error.code === 11000) {
            return NextResponse.json({ 
                message: "Event with this title already exists",
                errors: ["An event with this title already exists"]
            }, { status: 400 });
        }

        return NextResponse.json({ 
            message: "Failed to create event", 
            errors: [error instanceof Error ? error.message : "Unknown error"]
        }, { status: 500 });
    }

}

export async function GET() {
    try{
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: "Events retrieved successfully", events }, { status: 200 });
    }
    catch(error){
        console.error("Error retrieving events:", error);
        return NextResponse.json({ message: "Failed to retrieve events", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }   
}
