import { EventEmitter2 } from 'eventemitter2';

// Initialize an instance of EventEmitter2
const emitter = new EventEmitter2({
	wildcard: true, // Enables wildcard support
	delimiter: '.', // Sets delimiter for event namespaces (e.g., 'event.subevent')
	maxListeners: 15, // Optional: Set the max number of listeners
});
export default emitter;
