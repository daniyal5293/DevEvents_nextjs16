import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be either online, offline, or hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one agenda item is required',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook for slug generation and data normalization
EventSchema.pre('save', function () {
  const event = this as IEvent;

  // Generate slug only if title changed or document is new
  if (event.isModified('title') || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  // Normalize date to ISO format if it's not already
  if (event.isModified('date')) {
    event.date = normalizeDate(event.date);
  }

  // Normalize time format (HH:MM)
  if (event.isModified('time')) {
    event.time = normalizeTime(event.time);
  }
});

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to normalize date to ISO format
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Helper function to normalize time format
function normalizeTime(timeString: string): string {
  const singleTimeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const timeRangeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?\s*-\s*(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  
  const timeString_trimmed = timeString.trim();
  let rangeMatch = timeString_trimmed.match(timeRangeRegex);
  let singleMatch = timeString_trimmed.match(singleTimeRegex);
  
  // Helper to convert time parts
  const parseTime = (hours: number, minutes: string, period?: string): string => {
    let h = hours;
    if (period) {
      if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    }
    
    if (h < 0 || h > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59) {
      throw new Error('Invalid time values');
    }
    
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  };
  
  if (rangeMatch) {
    // Handle time range
    const startHours = parseInt(rangeMatch[1]);
    const startMinutes = rangeMatch[2];
    const startPeriod = rangeMatch[4];
    
    const endHours = parseInt(rangeMatch[5]);
    const endMinutes = rangeMatch[6];
    const endPeriod = rangeMatch[8];
    
    const startTime = parseTime(startHours, startMinutes, startPeriod);
    const endTime = parseTime(endHours, endMinutes, endPeriod);
    
    return `${startTime} - ${endTime}`;
  } else if (singleMatch) {
    // Handle single time
    const hours = parseInt(singleMatch[1]);
    const minutes = singleMatch[2];
    const period = singleMatch[4];
    
    return parseTime(hours, minutes, period);
  } else {
    throw new Error('Invalid time format. Use HH:MM, HH:MM AM/PM, or HH:MM AM/PM - HH:MM AM/PM');
  }
}

// Create unique index on slug for better performance
EventSchema.index({ slug: 1 }, { unique: true });

// Create compound index for common queries
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;