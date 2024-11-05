import ReactDOM from 'react-dom';

import Index from './index';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import { LowCodeItemContainer, LowCodeDragItem } from '../iframe-component';
import useIframeInstance, { IframeListenProvider } from '@/iframe-component/useIframeInstance';
window.LowCodeItemContainer = LowCodeItemContainer;
window.LowCodeDragItem = LowCodeDragItem;

const App = () => {
	return (
		<IframeListenProvider>
			<DndProvider backend={HTML5Backend} context={window}>
				<Index />
			</DndProvider>
		</IframeListenProvider>
	);
};
ReactDOM.render(<App />, document.getElementById('root'));
