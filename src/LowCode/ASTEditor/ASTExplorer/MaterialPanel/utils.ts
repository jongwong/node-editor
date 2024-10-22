import { forIn, groupBy } from 'lodash';

import materialStore from '@/LowCode/ASTEditor/ASTExplorer/material-store';

const formatName = (name: string, importName: string) => {
	return importName + '__' + name;
};
(window as any)._lowCodeImport = {};
export const generateCodeAll = () => {
	const _data = groupBy(materialStore.data, it => it.import);
	const strList: string[] = [];
	const useStrList: string[] = [];
	const parentList: string[] = [];

	forIn(_data, (it, key) => {
		strList.push(
			`import { ${it
				.filter(it => !it.parentName)
				.map(it => it.name + ' as ' + formatName(it.name, it.import))
				.join(', ')} } from "${key}";`
		);
		it.forEach(it => {
			if (it.parentName) {
				parentList.push(
					`const { ${it.name}: ${formatName(it.name, it.import)}  } = ${formatName(
						it.parentName,
						it.import
					)};`
				);
			}
			useStrList.push(
				`window._lowCodeImport.${formatName(it.name, it.import)} = ${formatName(
					it.name,
					it.import
				)};`
			);
		});
	});
	useStrList.push('export default  () => null;');
	return strList.join('\n') + '\n\n' + parentList.join('\n') + '\n\n' + useStrList.join('\n');
};
export const getMaterialModule = (name: string, importName: string) => {
	return (window as any)._lowCodeImport[formatName(name, importName)];
};
