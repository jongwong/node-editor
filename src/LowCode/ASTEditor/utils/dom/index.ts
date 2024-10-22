// eslint-disable-next-line import/prefer-default-export,no-unused-vars
import { forEach } from 'lodash';

import { EOperationAttributeName, EOperationClassName } from '@/LowCode/ASTEditor/constants';
import { addClassName, removeClassName } from '@/LowCode/ASTEditor/utils/dom/class-operation';
import { hasClassName } from '@/LowCode/util';

export const findParentNode = (el: HTMLElement, cb: (parentEl: HTMLElement) => boolean) => {
	if (cb(el)) {
		return el;
	}

	if (el.parentElement && cb(el.parentElement)) {
		return el.parentElement;
	}
	if (el.parentElement !== document.body) {
		return findParentNode(el.parentElement, cb);
	}

	return null;
};
export const isHoverTarget = (el: HTMLElement) => {
	return el.classList.contains('low-code-target-item');
};

export const initHoverEvent = (previewEl: HTMLElement) => {
	const elList = previewEl.querySelectorAll(`[low-code-uuid]`);
	forEach(elList, it => {
		it.addEventListener(
			'mousemove',
			e => {
				const find = findParentNode(e.target, p => isHoverTarget(p));
				const list = previewEl.getElementsByClassName(EOperationClassName.LowCodeTargetItemHover);
				forEach(list, _it => {
					if (find !== _it) {
						removeClassName(_it, EOperationClassName.LowCodeTargetItemHover);
					}
				});

				if (find && !hasClassName(find, EOperationClassName.LowCodeTargetItemHover)) {
					addClassName(find, EOperationClassName.LowCodeTargetItemHover);
					e.stopPropagation();
					return false;
				}
			},
			true
		);
	});
};

export const initDoubleEvent = (
	previewEl: HTMLElement,
	cb: (name: string, data: { id: string; event: any }) => void
) => {
	previewEl.ondblclick = e => {
		const find = findParentNode(e.target, p => isHoverTarget(p));
		const id = find.getAttribute(EOperationAttributeName.UUId);
		addClassName(find, EOperationClassName.LowCodeTargetItemSelect);
		cb('object:dblclick', {
			id,
			event: e,
		});
	};
};

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
