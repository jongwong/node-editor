export const isAnchor = (ev: any) => {
	const { target } = ev;

	return hasClassName(target, 'anchor-point');
};
export const isAnchorIn = (target: any) => hasClassName(target, 'anchor-point-in');
export const isAnchorOut = (target: any) => hasClassName(target, 'anchor-point-out');

export const formatData = function (data: any) {
	// data.nodes.forEach((node: any) => {
	// 	node.anchorText.forEach((item: any) => {});
	// });
};

const getClassName = (target: any) => {
	if (target?.attrs && target?.attrs?.class) {
		return target.attrs.class;
	}
	return undefined;
};

export const hasClassName = (target: any, name: string) => {
	const targetName = getClassName(target) || '';
	if ((targetName.split(' ') as string).includes(name)) return true;
};
