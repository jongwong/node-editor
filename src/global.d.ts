import React from 'react';

declare global {
	let LowCodeItemContainer: React.FC<any>;
	let LowCodeDragItem: React.FC<any>;
}
declare module '*.svg' {
	const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
	export default ReactComponent;
}
