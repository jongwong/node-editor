import {
	cloneDeep,
	forIn,
	get,
	isArray,
	isNumber,
	isObject,
	isString,
	keys,
	pick,
	set,
	take,
} from 'lodash';

export const searchNode = (
	node: any,
	_searchNodeStr: string,
	storeList: any[] = [],
	lastKeys: string[] = []
) => {
	if (!_searchNodeStr) {
		return [];
	}
	const searchList = _searchNodeStr.replace(' ', '').split('=');
	keys(node).forEach(_it => {
		let it: any = _it;
		if (isArray()) {
			it = Number(_it);
		}

		const item = node[it];
		const newKey = [...lastKeys, it];
		if (isString(item) || isNumber(item)) {
			const str = item.toString();
			if (
				searchList.length === 2
					? searchList[0] === _it && str.indexOf(searchList[1]) >= 0
					: str.indexOf(_searchNodeStr) >= 0
			) {
				storeList.push(newKey);
			}
		}
		if (isArray(item) || isObject(item)) {
			searchNode(item, _searchNodeStr, storeList, newKey);
		}
	});
	if (lastKeys?.length === 0) {
		return storeList;
	}
	return [];
};

export const getFormatAstJson = (astJson, searchKeysList) => {
	if (searchKeysList.length) {
		const ob = {};
		const cloneAst = cloneDeep(astJson);
		searchKeysList.forEach(it => {
			const _key = it.length >= 4 ? take(it, it.length - 2) : it;
			set(ob, _key, get(cloneAst, _key));
			it.forEach((_, idx: number) => {
				const childKey: string[] = take(it, idx);
				const _childKey: string[] = [...childKey, 'loc'];
				const loc = get(cloneAst, _childKey);
				if (loc) {
					set(ob, _childKey, loc);
				}
			});
		});
		return ob;
	}
	return astJson;
};

export const getLocByKeysList = (keyList, _astJson) => {
	const oldKeys = cloneDeep(keyList).reverse();
	const _keys = take(oldKeys, oldKeys.length - 1);
	let find = _keys.length ? get(_astJson, _keys) : _astJson;

	if (!find?.loc) {
		find = get(_astJson, oldKeys);
	}

	return find?.loc;
};
export const findKeyListByLoc = (
	cursorSelectionLoc,
	astJson,
	keyStore: string[] = [],
	parentKey: string[] = []
) => {
	forIn(astJson, (it, key) => {
		const loc = it?.loc;
		const curKeys = [...parentKey, key];
		if (
			loc &&
			cursorSelectionLoc &&
			loc.start.line >= cursorSelectionLoc?.startLineNumber &&
			loc.end.line <= cursorSelectionLoc?.endLineNumber
		) {
			keyStore.push(curKeys);
		}
		if (isObject(it)) {
			findKeyListByLoc(cursorSelectionLoc, it, keyStore, curKeys);
		}
	});
	return keyStore;
};

export const scrollToMarkJsonNode = () => {
	let el = document.querySelector('.json-preview-is-include-selection');
	if (!el) {
		el = document.querySelector('.json-tree-find-active');
	}
	if (el) {
		el.scrollIntoView({
			block: 'center',
			inline: 'center',
		});
	}
};
