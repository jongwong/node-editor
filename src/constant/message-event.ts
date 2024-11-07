import { onItemDrop } from '@/iframe-component/useIframeInstance';
import { postAskAttributeValue } from '@/iframe-component/useParentIframeMessage';

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
	AskAttributeValue = 'AskAttributeValue',
	SendAttributeValue = 'SendAttributeValue',
}
