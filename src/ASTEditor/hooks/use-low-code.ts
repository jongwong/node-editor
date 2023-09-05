import { useDebounceFn } from 'ahooks';

import { initDoubleEvent, initHoverEvent } from '@/ASTEditor/util/dom';

const useLowCode = (props: { preElement: HTMLElement | undefined; dataMap: any }) => {
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
	};
	const { run: debounceReload } = useDebounceFn(() => reload(), { wait: 500, leading: false });
	return {
		reload: debounceReload,
	};
};
export default useLowCode;
