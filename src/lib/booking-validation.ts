/**
 * Booking validation utilities for tattoo shop booking system
 *
 * Handles validation logic for booking requests, time slot availability,
 * and duration estimation based on service type.
 */

import { ServiceType, BookingStatus } from '@/generated/prisma';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Schema for validating booking request input
 */
export const bookingRequestSchema = z.object({
  clientName: z.string().min(2, 'Name must be at least 2 characters'),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().optional(),

  serviceType: z.enum(['CONSULTATION', 'TATTOO_SESSION']),
  artistId: z.string().min(1, 'Artist must be selected'),

  preferredDate: z.coerce.date()
    .refine(date => date > new Date(), 'Date must be in the future'),
  preferredTimeSlot: z.string()
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Time slot must be in format HH:MM-HH:MM'),

  // Tattoo-specific fields (optional for consultation)
  description: z.string().optional(),
  referenceImages: z.array(z.string().url()).optional().default([]),
  bodyPlacement: z.string().optional(),
  sizeEstimate: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).optional(),

  // Multi-session support
  isMultiSession: z.boolean().optional().default(false),
  parentBookingId: z.string().optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/**
 * Schema for availability slot configuration
 */
export const availabilitySlotSchema = z.object({
  artistId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format'),
  slotDuration: z.number().min(30).max(480).default(120), // 30min to 8 hours
  isActive: z.boolean().default(true),
}).refine(
  data => {
    const start = timeToMinutes(data.startTime);
    const end = timeToMinutes(data.endTime);
    return end > start;
  },
  { message: 'End time must be after start time' }
);

export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;

// ============================================
// DURATION CALCULATION
// ============================================

/**
 * Calculate estimated duration for a booking based on service type
 *
 * @param serviceType - Type of service (CONSULTATION or TATTOO_SESSION)
 * @param sizeEstimate - For tattoos, size estimate affects duration
 * @returns Duration in minutes
 */
export function calculateDuration(
  serviceType: ServiceType,
  sizeEstimate?: string
): number {
  if (serviceType === 'CONSULTATION') {
    return 30; // Standard consultation: 30 minutes
  }

  // Tattoo session durations based on size
  const durationMap: Record<string, number> = {
    'SMALL': 120,        // 2 hours
    'MEDIUM': 240,       // 4 hours
    'LARGE': 360,        // 6 hours
    'EXTRA_LARGE': 480,  // 8 hours (full day)
  };

  return durationMap[sizeEstimate || 'MEDIUM'] || 240;
}

// ============================================
// TIME SLOT VALIDATION
// ============================================

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Parse time slot string (e.g., "09:00-11:00") into start and end minutes
 */
export function parseTimeSlot(slot: string): { start: number; end: number } {
  const [startTime, endTime] = slot.split('-');
  return {
    start: timeToMinutes(startTime),
    end: timeToMinutes(endTime),
  };
}

/**
 * Check if a time slot overlaps with existing bookings
 *
 * @param requestedSlot - Requested time slot string (e.g., "09:00-11:00")
 * @param existingBookings - Array of existing booking time slots
 * @returns true if slot is available, false if there's overlap
 */
export function checkSlotAvailability(
  requestedSlot: string,
  existingBookings: string[]
): boolean {
  const requested = parseTimeSlot(requestedSlot);

  for (const existingSlot of existingBookings) {
    const existing = parseTimeSlot(existingSlot);

    // Check for overlap:
    // Overlap occurs if start is before existing end AND end is after existing start
    const overlaps = requested.start < existing.end && requested.end > existing.start;

    if (overlaps) {
      return false;
    }
  }

  return true;
}

/**
 * Generate available time slots for a given day
 *
 * @param startTime - Day start time (HH:MM)
 * @param endTime - Day end time (HH:MM)
 * @param slotDuration - Duration of each slot in minutes
 * @param existingBookings - Already booked slots for this day
 * @returns Array of available time slot strings
 */
export function generateAvailableSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
  existingBookings: string[] = []
): string[] {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const availableSlots: string[] = [];

  let currentStart = startMinutes;

  while (currentStart + slotDuration <= endMinutes) {
    const currentEnd = currentStart + slotDuration;
    const slotString = `${minutesToTime(currentStart)}-${minutesToTime(currentEnd)}`;

    // Only add if not conflicting with existing bookings
    if (checkSlotAvailability(slotString, existingBookings)) {
      availableSlots.push(slotString);
    }

    currentStart += slotDuration;
  }

  return availableSlots;
}

// ============================================
// BOOKING REQUEST VALIDATION
// ============================================

/**
 * Validate a booking request
 *
 * @param input - Booking request data
 * @returns Validated booking request or throws validation error
 */
export function validateBookingRequest(input: unknown): BookingRequestInput {
  return bookingRequestSchema.parse(input);
}

/**
 * Validate availability slot configuration
 *
 * @param input - Availability slot data
 * @returns Validated slot configuration or throws validation error
 */
export function validateAvailabilitySlot(input: unknown): AvailabilitySlotInput {
  return availabilitySlotSchema.parse(input);
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Check if a date falls on a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a date is a valid booking date (not in the past, not too far in future)
 *
 * @param date - Date to check
 * @param maxDaysInFuture - Maximum days in advance to allow booking (default: 90)
 * @returns true if date is valid for booking
 */
export function isValidBookingDate(date: Date, maxDaysInFuture: number = 90): boolean {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

  return date > now && date <= maxDate;
}

/**
 * Get the next available booking date (skips past dates)
 *
 * @param daysAhead - How many days ahead to start checking (default: 1)
 * @returns Date object for next available date
 */
export function getNextAvailableDate(daysAhead: number = 1): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(0, 0, 0, 0);
  return date;
}
