import React, { cloneElement, isValidElement, useContext, useRef } from 'react';

type LowCodeDragItemProps = {
	children?: React.ReactNode;
};
const LowCodeDragItem: React.FC<LowCodeDragItemProps> = props => {
	const { children, ...rest } = props;
	console.log('======rest====>', rest);
	const el = isValidElement(children) ? cloneElement(children, { ...rest }) : children;
	return el as any;
};
export default LowCodeDragItem;
