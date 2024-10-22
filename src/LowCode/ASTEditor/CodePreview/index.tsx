import React, { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';

import { ReactLiveEditorPreview } from '@jongwong/react-live-editor';

import {
	addClassName,
	clearClosest,
	removeClassName,
} from '@/LowCode/ASTEditor/utils/dom/class-operation';

import customGlobalRequire from './customGlobalRequire';

type CodePreviewProps = {
	files: any[];
	demoId: string;
	onPreviewReRender?: () => void;
};
const MAX_DISTANCE = 100; // 设定最大距离
const CodePreview: React.FC<CodePreviewProps> = props => {
	const { files, onPreviewReRender, demoId, ...rest } = props;
	const { error, bundle, exports, Preview } = ReactLiveEditorPreview({
		files,
		demoId,
		customRequire: customGlobalRequire,
	});
	const fileRef = useRef('');

	useEffect(() => {
		const str = JSON.stringify(files.sort((a, b) => a.filename.localeCompare(b.filename)));

		if (str !== fileRef.current) {
			bundle(files);
			fileRef.current = str;
		}
	}, [files]);
	const renderPreview = () => {
		if (Preview) {
			onPreviewReRender?.();
		}

		return Preview ? <Preview /> : null;
	};
	const curRef = useRef<HTMLDivElement>();
	useEffect(() => {
		if (!curRef?.current) {
			return;
		}
		const handleMouseMove = (event: MouseEvent) => {
			if (!document.body.classList.contains('low-code-container__dragging')) {
				return;
			}

			const containers = document.querySelectorAll('.low-code-container');
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			let closestContainer = null;
			let closestDistance = Infinity;

			// 遍历找到距离鼠标最近的 `.low-code-container`
			containers.forEach(container => {
				const rect = container.getBoundingClientRect();
				const distanceX = Math.max(0, Math.abs(mouseX - (rect.left + rect.width / 2)));
				const distanceY = Math.max(0, Math.abs(mouseY - (rect.top + rect.height / 2)));
				const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

				// 更新最小距离和最近的 container
				if (distance < closestDistance) {
					closestDistance = distance;
					closestContainer = container;
				}

				// 判断是否在鼠标 200 像素的范围内
				if (distance <= MAX_DISTANCE) {
					// 先把所有符合 200 像素范围的加上 `low-code-container-hover`
					addClassName(container, 'low-code-container-hover');
				} else {
					// 超出范围的移除 `low-code-container-hover`
					removeClassName(container, 'low-code-container-hover');
				}
			});

			// 如果找到最近的 container
			if (closestContainer) {
				// 移除其他元素的 `low-code-container-closest`
				containers.forEach(container => {
					if (container !== closestContainer) {
						removeClassName(container, 'low-code-container-closest');
					}
				});
				// 为最近的元素加上 `low-code-container-closest`
				addClassName(closestContainer, 'low-code-container-closest');
				// 同时移除它的 `low-code-container-hover`
				removeClassName(closestContainer, 'low-code-container-hover');
			}
		};
		curRef.current?.addEventListener('dragover', handleMouseMove);

		return () => {
			curRef.current?.removeEventListener('dragover', handleMouseMove);
		};
	}, [curRef.current]);

	return (
		<div ref={curRef} id={'low-code-preview'}>
			<div>{error ? error?.message : null}</div>
			{renderPreview()}
		</div>
	);
};
export default CodePreview;
