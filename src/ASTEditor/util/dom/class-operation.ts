export const addClassName = (el: HTMLElement, name: string) => {
	if (!el?.classList?.contains(name)) {
		el?.classList?.add(name);
	}
};
export const removeClassName = (el: HTMLElement, name: string) => {
	if (el?.classList?.contains(name)) {
		el?.classList?.remove(name);
	}
};
export const hasClassName = (el: HTMLElement, name: string) => el?.classList?.contains(name);

export const clearClosest = () => {
	const els = document.querySelectorAll('.low-code-container-closest');
	els.forEach(it => {
		removeClassName(it, 'low-code-container-closest');
	});
	const els2 = document.querySelectorAll('.low-code-container-hover');
	els2.forEach(it => {
		removeClassName(it, 'low-code-container-hover');
	});
};
