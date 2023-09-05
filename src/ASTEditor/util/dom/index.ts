// eslint-disable-next-line import/prefer-default-export,no-unused-vars
import { forEach } from 'lodash';

import { EOperationAttributeName, EOperationClassName } from '@/ASTEditor/constants';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';
import { hasClassName } from '@/util';

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
