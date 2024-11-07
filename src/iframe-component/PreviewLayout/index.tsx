import React, { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom';

import useContainerListen from '@/iframe-component/useContainerListen';
import useIframeInstance, { IframeListenProvider } from '@/iframe-component/useIframeInstance';

import { LowCodeDragItem, LowCodeItemContainer } from '../';

(window as any).LowCodeItemContainer = LowCodeItemContainer;
(window as any).LowCodeDragItem = LowCodeDragItem;

const PreviewLayout: React.FC<{ Component: React.FC }> = ({ Component }) => {
	const curRef = useRef<HTMLDivElement>();
	const { onRef } = useContainerListen();
	return (
		<div ref={onRef} style={{ border: '24px solid #eee', background: 'eee' }}>
			<DndProvider backend={HTML5Backend} context={window}>
				<IframeListenProvider>
					<Component />
				</IframeListenProvider>
			</DndProvider>
		</div>
	);
};
export default PreviewLayout;
