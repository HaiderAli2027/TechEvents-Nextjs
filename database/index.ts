/**
 * Database models index file
 * Exports all Mongoose models and interfaces for use throughout the application
 */

import Event from './event.model';
import Booking from './booking.model';

export { Event, Booking };
export type { IEvent } from './event.model';
export type { IBooking } from './booking.model';
