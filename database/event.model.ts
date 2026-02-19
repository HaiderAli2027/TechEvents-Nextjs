import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Event document interface for type safety
 */
interface IEvent extends Document {
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

/**
 * Event schema with validation and pre-save hooks
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
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
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (agenda: string[]) => agenda.length > 0,
        message: 'Agenda must contain at least one item',
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
        validator: (tags: string[]) => tags.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook to generate slug, normalize date/time, and validate
 */
eventSchema.pre<IEvent>('save', async function (next) {
  // Only regenerate slug if title is modified
  if (this.isModified('title')) {
    // Generate URL-friendly slug from title
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    // Append a unique suffix to avoid collisions
    const existing = await mongoose.models.Event.findOne({ slug: baseSlug, _id: { $ne: this._id } });
    this.slug = existing ? `${baseSlug}-${this._id}` : baseSlug;
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  try {
    const dateObj = new Date(this.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format');
    }
    this.date = dateObj.toISOString().split('T')[0];
  } catch {
    return next(new Error('Date must be a valid date string'));
  }

  // Normalize time to HH:mm format
  if (!/^([0-1]\d|2[0-3]):[0-5]\d$/.test(this.time)) {
    return next(new Error('Time must be in HH:mm format (24-hour)'));
  }

  next();
});

/**
 * Create or retrieve the Event model
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export { Event, IEvent };
