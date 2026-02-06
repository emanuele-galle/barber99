import { EventEmitter } from 'events'

// In-memory event emitter for SSE notifications
// Single container = EventEmitter works perfectly
export const bookingEvents = new EventEmitter()
bookingEvents.setMaxListeners(20) // Support multiple admin tabs
