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
