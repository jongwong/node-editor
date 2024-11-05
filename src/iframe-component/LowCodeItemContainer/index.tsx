import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import classNames from 'classnames';

import useIframeInstance, {
	useASTJson,
	useCurrentItemId,
} from '@/iframe-component/useIframeInstance';
import { EDragItemType } from '@/LowCode/ASTEditor/constants';
import { getJSXElementName } from '@/LowCode/ASTEditor/utils/ast-node';

import '../index.less';

import { isHorizontalOrVertical, isIframe } from '../utils';

type LowCodeItemContainerProps = {
	children?: React.ReactNode;
	_low_code_id: string;
	_low_code_parent_id: string;
};

const LowCodeItemContainer: React.FC<LowCodeItemContainerProps> = props => {
	const { _low_code_id: uuid, _low_code_parent_id, ...rest } = props;

	const currentItemId = useCurrentItemId();
	const ASTJson = useASTJson();
	const { getNodeById } = useIframeInstance();
	const curRef = useRef<HTMLDivElement | null>();
	const parentNode = useMemo(
		() => getNodeById(_low_code_parent_id),
		[currentItemId, uuid, _low_code_parent_id]
	);

	const lastItemRef = useRef();
	const [{ isOver, isOverCurrent, item }, dropRef] = useDrop(
		() => ({
			accept: [EDragItemType.LowCodeDragItem, EDragItemType.MaterialItem],
			collect: monitor => {
				return {
					// 是否放置在目标上
					isOver: monitor.isOver(),
					item: monitor.getItem(),
					isOverCurrent: monitor.isOver({ shallow: true }),
				};
			},
		}),
		[ASTJson, uuid]
	);
	useEffect(() => {
		if (item) {
			lastItemRef.current = item;
		}
	}, [item]);

	const [direction, setDirection] = useState();
	const getDirection = () => {
		if (curRef.current) {
			return isHorizontalOrVertical(curRef.current);
		}
		return 'vertical';
	};
	useEffect(() => {
		if (!curRef.current) {
			return;
		}
		const d = getDirection();
		if (d !== direction) {
			setDirection(d);
		}
	}, [curRef.current]);

	const ob = {
		_low_code_id: uuid,
		_low_code_parent_id: _low_code_parent_id,
	};
	if (isIframe()) {
		return null;
	}
	return (
		<div
			className={classNames('low-code-container', direction && 'low-code-container-' + direction)}
			{...ob}
			ref={e => {
				curRef.current = e;
				dropRef(e);
			}}
		>
			<span className={'low-code-container-label'}>{getJSXElementName(parentNode)}</span>
		</div>
	);
};

export default LowCodeItemContainer;
