import { Dispatch, SetStateAction, useRef, useState } from 'react';

const useProState: <S>(initialState: S | (() => S)) => [S, Dispatch<SetStateAction<S>>, () => S] = (
	initialState,
	...args
) => {
	const [state, _setState] = useState(initialState, ...args);
	const stateRef = useRef(initialState);
	const setState = (e: any) => {
		stateRef.current = e;
		_setState(e);
	};
	const getState = () => {
		return stateRef.current;
	};
	return [state, setState, getState];
};
export default useProState;
