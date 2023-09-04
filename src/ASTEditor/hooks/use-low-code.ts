import { useDebounceFn } from 'ahooks';

import { initDoubleEvent, initHoverEvent } from '@/ASTEditor/util/dom';

const useLowCode = (props: {
	preElement: HTMLElement | undefined;
	dataMap: any;
	onComponentDoubleClick: (e: { id: string; event: any; data: any }) => void;
}) => {
	const { preElement, dataMap, onComponentDoubleClick } = props;
	const getDataById = (id: string) => {
		return dataMap?.idMap[id];
	};
	const reload = () => {
		if (!preElement) {
			return;
		}

		const el = preElement.querySelector(`[low-code-uuid]`);
		if (!el) {
			return;
		}

		initHoverEvent(preElement);
		initDoubleEvent(preElement, (name, e) => {
			if (name === 'object:dblclick') {
				console.log('======dataMap====>', dataMap);
				onComponentDoubleClick?.({ ...e, data: getDataById(e.id) });
			}
		});
	};
	const { run: debounceReload } = useDebounceFn(() => reload(), { wait: 500, leading: false });
	return {
		reload: debounceReload,
	};
};
export default useLowCode;
