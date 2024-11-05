import { onItemDrop } from '@/iframe-component/useIframeInstance';

export enum LowCodeMessageEvent {
	LowCodeDragItemDoubleClick = 'LowCodeDragItemDoubleClick',
	AttributeValueChange = 'AttributeValueChange',
	CurrentItemId = 'CurrentItemId',
	CurrentItemChildId = 'CurrentItemChildId',
	TransformCode = 'TransformCode',
	AstJson = 'AstJson',
	LowcodeInstanceData = 'LowcodeInstanceData',
	IframeReady = 'IframeReady',
	OnItemDrop = 'OnItemDrop',
	DraggingStateChange = 'DraggingStateChange',
}
