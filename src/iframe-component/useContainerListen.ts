import { useEffect, useRef } from 'react';

import { addClassName, removeClassName } from '@/LowCode/ASTEditor/utils/dom/class-operation';

const MAX_DISTANCE = 100; // 设定最大距离
const useContainerListen = () => {
	const elRef = useRef<HTMLElement>();
	useEffect(() => {
		const element = elRef.current;
		if (!element) {
			return;
		}
		const handleMouseMove = (event: MouseEvent) => {
			if (!document.body.classList.contains('low-code-container__dragging')) {
				return;
			}

			const containers: any = document.querySelectorAll('.low-code-container');
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			let closestContainer: any = null;
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
		element?.addEventListener('dragover', handleMouseMove);

		return () => {
			element?.removeEventListener('dragover', handleMouseMove);
		};
	}, [elRef.current]);
	return {
		onRef: (e: HTMLElement | undefined) => {
			elRef.current = e;
		},
	};
};
export default useContainerListen;
