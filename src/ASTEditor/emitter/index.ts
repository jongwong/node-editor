import mitt from 'mitt';

// eslint-disable-next-line no-shadow
export const enum LowCodeEvenEmitterName {
	ComponentDoubleClick = 'ComponentDoubleClick',
}

const emitter = mitt();

export default emitter;
