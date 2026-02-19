import mongoose, { Document, Schema, Model } from 'mongoose';
import { Event } from './event.model';

/**
 * Booking document interface for type safety
 */
interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema with email validation and event reference
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
  },
  { timestamps: true }
);

// Create index on eventId for optimized queries
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to validate that referenced event exists
 */
bookingSchema.pre<IBooking>('save', async function (next) {
  try {
    // Verify that the referenced event exists
    const eventExists = await Event.findById(this.eventId);
    if (!eventExists) {
      return next(
        new Error(`Event with ID ${this.eventId} does not exist`)
      );
    }
  } catch (error) {
    return next(
      new Error('Error validating event reference during booking save')
    );
  }

  next();
});

/**
 * Create or retrieve the Booking model
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export { Booking, IBooking };
