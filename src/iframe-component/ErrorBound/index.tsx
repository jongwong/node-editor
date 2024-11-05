import React, { PureComponent, useEffect, useRef } from 'react';

import { has } from 'lodash';

class InnerErrorBound extends PureComponent {
	constructor(props: any) {
		super(props);
		this.state = {
			hasError: false,
		};
	}

	static getDerivedStateFromProps(props: any, state: any) {
		return {
			...state,
			hasError: state?.hasError,
		};
	}

	static getDerivedStateFromError(error: any) {
		// 更新 state 使下一次渲染能够显示降级后的 UI
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		// eslint-disable-next-line react/prop-types
		(this.props as any)?.onDidCatch?.(error, errorInfo);
	}

	render() {
		// eslint-disable-next-line react/prop-types
		(this.props as any)?.actionRef({
			clearError: () => {
				this.setState({
					hasError: undefined,
				});
			},
		});
		if ((this.state as any)?.hasError) {
			return has(this.props, 'fallbackRender') ? (
				// eslint-disable-next-line react/prop-types
				(this.props as any)?.fallbackRender?.(<DefaultErrorContent />)
			) : (
				<DefaultErrorContent />
			);
		}

		// eslint-disable-next-line react/prop-types
		return (this.props as any)?.children;
	}
}
export const DefaultErrorContent = () => <div style={{ color: 'yellow' }}>出错啦 ！！！</div>;
const ErrorBound = (props: any) => {
	const actionRef = useRef<any>();
	useEffect(() => {
		// 属性变了清除错误状态
		actionRef.current?.clearError();
	}, [props]);
	return (
		<InnerErrorBound
			{...props}
			actionRef={(e: any) => {
				actionRef.current = e;
			}}
			onDidCatch={(err: any, info: any) => {
				console.error(err);
				props?.onDidCatch?.(err, info);
			}}
		/>
	);
};
export default ErrorBound;
