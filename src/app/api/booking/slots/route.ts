/**
 * Available Slots API Endpoint
 *
 * GET /api/booking/slots?artistId=XXX&date=YYYY-MM-DD
 *
 * Returns available time slots for a specific artist on a given date,
 * accounting for:
 * - Artist's configured availability (AvailabilitySlot)
 * - Existing bookings (BookingRequest)
 * - Availability exceptions (holidays, vacations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAvailableSlots, isValidBookingDate } from '@/lib/booking-validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artistId = searchParams.get('artistId');
    const dateParam = searchParams.get('date');
    const serviceType = searchParams.get('serviceType') || 'TATTOO_SESSION';

    // Validate required parameters
    if (!artistId) {
      return NextResponse.json(
        { error: 'artistId parameter is required' },
        { status: 400 }
      );
    }

    if (!dateParam) {
      return NextResponse.json(
        { error: 'date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse and validate date
    const requestedDate = new Date(dateParam);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if date is valid for booking
    if (!isValidBookingDate(requestedDate)) {
      return NextResponse.json(
        { error: 'Date must be in the future and within 90 days' },
        { status: 400 }
      );
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = requestedDate.getDay();

    // Check for availability exceptions on this date
    const exception = await prisma.availabilityException.findFirst({
      where: {
        artistId,
        date: {
          gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    // If there's an exception, no slots available
    if (exception) {
      return NextResponse.json({
        artistId,
        date: dateParam,
        dayOfWeek,
        availableSlots: [],
        reason: exception.reason || 'Not available on this date',
        exception: true,
      });
    }

    // Get artist's availability configuration for this day
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        artistId,
        dayOfWeek,
        isActive: true,
      },
    });

    // If artist doesn't work on this day
    if (availabilitySlots.length === 0) {
      return NextResponse.json({
        artistId,
        date: dateParam,
        dayOfWeek,
        availableSlots: [],
        reason: 'Artist not available on this day of the week',
        exception: false,
      });
    }

    // Get existing bookings for this artist on this date
    const existingBookings = await prisma.bookingRequest.findMany({
      where: {
        artistId,
        preferredDate: {
          gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
        },
        status: {
          in: ['PENDING', 'APPROVED'], // Only count active bookings
        },
      },
      select: {
        preferredTimeSlot: true,
      },
    });

    const bookedSlots = existingBookings.map(b => b.preferredTimeSlot);

    // Generate available slots for each availability period
    const allAvailableSlots: string[] = [];

    for (const slot of availabilitySlots) {
      const slotsForPeriod = generateAvailableSlots(
        slot.startTime,
        slot.endTime,
        slot.slotDuration,
        bookedSlots
      );

      allAvailableSlots.push(...slotsForPeriod);
    }

    // Sort slots chronologically
    allAvailableSlots.sort((a, b) => {
      const [aStart] = a.split('-');
      const [bStart] = b.split('-');
      return aStart.localeCompare(bStart);
    });

    return NextResponse.json({
      artistId,
      date: dateParam,
      dayOfWeek,
      availableSlots: allAvailableSlots,
      totalSlots: allAvailableSlots.length,
      serviceType,
      exception: false,
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
