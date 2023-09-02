import React, { useEffect, useRef } from 'react';

import { init } from '@/NodeEditor/graph';

import './index.css';

const index: React.FC = props => {
	const { ...rest } = props;
	const ref = useRef<any>();
	useEffect(() => {
		// eslint-disable-next-line no-unused-expressions
		ref.current && init(ref.current);
	}, [ref.current]);
	return <div id="container" ref={ref} />;
};
export default index;
