import React, { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';

import { ReactLiveEditorPreview } from '@jongwong/react-live-editor';

import customGlobalRequire from './customGlobalRequire';

type CodePreviewProps = {
	files: any[];
	demoId: string;
	onPreviewReRender?: () => void;
};

const CodePreview: React.FC<CodePreviewProps> = props => {
	const { files, onPreviewReRender, demoId, ...rest } = props;
	const { error, bundle, exports, Preview } = ReactLiveEditorPreview({
		files,
		demoId,
		customRequire: customGlobalRequire,
	});
	const fileRef = useRef('');

	useEffect(() => {
		const str = JSON.stringify(files.some((a, b) => a.filename.localeCompare(b.filename)));
		if (str !== fileRef.current) {
			bundle(files);
		}
	}, [files]);
	const renderPreview = () => {
		if (Preview) {
			onPreviewReRender?.();
		}

		return Preview ? <Preview /> : null;
	};
	return (
		<div>
			<div>{error ? error?.message : null}</div>
			{renderPreview()}
		</div>
	);
};
export default CodePreview;
