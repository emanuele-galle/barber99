/**
 * Seed availability slots for artists
 *
 * Creates default availability configuration for each artist.
 * Run with: npm run seed:availability
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Default artist IDs - update these with actual artist IDs from Payload CMS
// You can get these by querying the artists collection in Payload
const ARTISTS = [
  {
    id: 'default-artist-1',
    name: 'Cosimo Pisani',
  },
  // Add more artists as needed
];

// Default availability: Monday-Friday 9am-6pm, closed weekends
const DEFAULT_AVAILABILITY = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Friday
];

async function main() {
  console.log('🌱 Seeding availability slots...\n');

  for (const artist of ARTISTS) {
    console.log(`Setting up availability for ${artist.name}...`);

    // Delete existing availability for this artist (idempotent seed)
    await prisma.availabilitySlot.deleteMany({
      where: { artistId: artist.id },
    });

    // Create availability slots
    for (const slot of DEFAULT_AVAILABILITY) {
      const created = await prisma.availabilitySlot.create({
        data: {
          artistId: artist.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDuration: 120, // 2-hour slots for tattoos
          isActive: true,
        },
      });

      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek];
      console.log(`  ✓ ${dayName}: ${slot.startTime} - ${slot.endTime}`);
    }

    console.log(`\n`);
  }

  // Seed some example exceptions (holidays, vacations)
  console.log('Adding example availability exceptions...\n');

  const christmasDate = new Date(new Date().getFullYear(), 11, 25); // Dec 25
  const newYearDate = new Date(new Date().getFullYear() + 1, 0, 1); // Jan 1 next year

  for (const artist of ARTISTS) {
    // Christmas
    await prisma.availabilityException.upsert({
      where: {
        id: `${artist.id}-christmas-${christmasDate.getFullYear()}`,
      },
      create: {
        id: `${artist.id}-christmas-${christmasDate.getFullYear()}`,
        artistId: artist.id,
        date: christmasDate,
        reason: 'Christmas Holiday',
        isRecurring: true,
      },
      update: {},
    });

    // New Year
    await prisma.availabilityException.upsert({
      where: {
        id: `${artist.id}-newyear-${newYearDate.getFullYear()}`,
      },
      create: {
        id: `${artist.id}-newyear-${newYearDate.getFullYear()}`,
        artistId: artist.id,
        date: newYearDate,
        reason: 'New Year Holiday',
        isRecurring: true,
      },
      update: {},
    });

    console.log(`  ✓ ${artist.name}: Christmas and New Year holidays added`);
  }

  console.log('\n✅ Availability seeding complete!\n');

  // Display summary
  const totalSlots = await prisma.availabilitySlot.count();
  const totalExceptions = await prisma.availabilityException.count();

  console.log('Summary:');
  console.log(`  Availability slots: ${totalSlots}`);
  console.log(`  Exceptions: ${totalExceptions}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding availability:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
