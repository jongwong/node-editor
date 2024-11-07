import React from 'react';

import { LowCodeMessageEvent } from '@/constant/message-event';

export const hasDraggingElement = () => {
	return !!document.querySelector('.low-code-container__dragging');
};
function getRecentNonLowCodeSiblings(element) {
	let previous = element.previousElementSibling;
	let next = element.nextElementSibling;

	// 查找最近的 previousElementSibling
	while (previous && previous.classList.contains('low-code-container')) {
		previous = previous.previousElementSibling;
	}

	// 查找最近的 nextElementSibling
	while (next && next.classList.contains('low-code-container')) {
		next = next.nextElementSibling;
	}

	return { previousElementSibling: previous, nextElementSibling: next };
}

export function isHorizontalOrVertical(element) {
	const { previousElementSibling, nextElementSibling } = getRecentNonLowCodeSiblings(element);

	const rect1 = previousElementSibling ? previousElementSibling.getBoundingClientRect() : null;
	const rect2 = nextElementSibling ? nextElementSibling.getBoundingClientRect() : null;
	// 如果没有兄弟元素，默认返回垂直排列
	if (rect1 && rect2) {
		// 有两个兄弟元素的情况
		const isHorizontal = Math.abs(rect1.top - rect2.top) < Math.abs(rect1.left - rect2.left);
		return isHorizontal ? 'horizontal' : 'vertical';
	}

	// 如果只有一个兄弟元素，使用宽高和父元素的宽高判断
	const singleRect = rect1 || rect2;
	if (singleRect) {
		const parent = element.parentElement.getBoundingClientRect();
		if (!parent.width) {
			return 'vertical';
		}
		return singleRect.width / parent.width < 0.98 ? 'horizontal' : 'vertical';
	}
	return 'vertical';
}
export const wrapperMessage = e => {
	return { ...e, app: 'lowcode' };
};
export const postMessageToParent = (type: LowCodeMessageEvent, payload: any) => {
	const el = window.parent || window.opener;
	el.postMessage(
		wrapperMessage({
			type: type,
			payload,
		}),
		'*'
	);
};

export const getBaseUrl = () => {
	return window.location.protocol + '//' + window.location.host;
};
export const postMessageToChild = (type: LowCodeMessageEvent, payload: any) => {
	const el = document.getElementById('lowcode-preview') as HTMLIFrameElement;
	const url = getBaseUrl() + '/preview';
	el?.contentWindow?.postMessage(
		wrapperMessage({
			type: type,
			payload,
		}),
		url
	);
};

export const isIframe = () => window.top !== self || window.opener;

export function findFirstElementByLowCodeId(node: any, targetId: string) {
	// Check if the node is a React element
	if (React.isValidElement(node)) {
		// Check if the element has _low_code_id property and matches targetId
		if (node?.props?._low_code_id === targetId) {
			return node; // Return immediately upon finding the first match
		}

		// Recursively search children if they exist
		let found = null;
		React.Children.forEach(node?.props?.children, child => {
			if (!found) {
				// Only search further if we haven't found a match
				found = findFirstElementByLowCodeId(child, targetId);
			}
		});

		return found;
	}

	return null;
}
export const getMessageReactProps = cfg => {
	const ob = {};
	Object.keys(cfg).forEach(it => {
		const _val = cfg[it];
		let isValid = false;
		try {
			JSON.stringify(_val);
			isValid = true;
		} catch (e) {
			isValid = false;
		}
		if (isValid && it !== 'children') {
			ob[it] = _val;
		}
	});
	return ob;
};
