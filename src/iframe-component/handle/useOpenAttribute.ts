import { LowCodeMessageEvent } from '@/constant/message-event';
import { useCurrentItemChildId, useCurrentItemId } from '@/iframe-component/useIframeInstance';
import { postAskAttributeValue } from '@/iframe-component/useParentIframeMessage';
import emitter from '@/utils/event';

const useOpenAttribute = () => {
	const [_, setCurrentItemId] = useCurrentItemId();
	const [_currentItemChildId, setCurrentItemChildId] = useCurrentItemChildId();

	return (item: { _low_code_id: string; _low_code_child_id: string }, attributeValue?: any) => {
		// eslint-disable-next-line no-case-declarations
		const { _low_code_id, _low_code_child_id } = item;

		if (attributeValue || item?._low_code_type === 'JSXText') {
			emitter.emit(LowCodeMessageEvent.AttributeValueChange, attributeValue);

			setCurrentItemId(_low_code_id);
			setCurrentItemChildId(_low_code_child_id);
		} else {
			postAskAttributeValue(item);
		}
	};
};
export default useOpenAttribute;
