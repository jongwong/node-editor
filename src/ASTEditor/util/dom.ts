// eslint-disable-next-line import/prefer-default-export,no-unused-vars
import { forEach } from 'lodash';

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
	return ['ListItem'].includes(el.getAttribute('low-code-type'));
};

export const initHoverEvent = (previewEl: HTMLElement) => {
	const elList = previewEl.querySelectorAll(`[low-code-uuid]`);
	forEach(elList, it => {
		it.addEventListener(
			'mousemove',
			e => {
				const list = previewEl.querySelectorAll('.low-code-target');
				forEach(list, _it => {
					if (_it?.classList?.contains('low-code-target')) {
						_it?.classList?.remove('low-code-target');
					}
				});

				const find = findParentNode(e.target, p => isHoverTarget(p));

				if (find && !find?.classList?.contains('low-code-target')) {
					find.classList.add('low-code-target');
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
		const id = find.getAttribute('low-code-uuid');
		cb('object:dblclick', {
			id,
			event: e,
		});
	};
};
