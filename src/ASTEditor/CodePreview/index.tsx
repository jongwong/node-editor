import React, { useEffect, useRef } from 'react';

import { ReactLiveEditorPreview } from '@pupu/react-live-editor';

import customGlobalRequire from './customGlobalRequire';

type CodePreviewProps = {
	files: any[];
	demoId: string;
};

const CodePreview: React.FC<CodePreviewProps> = props => {
	const { files, demoId, ...rest } = props;
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
	const renderPreview = () => (Preview ? <Preview /> : null);
	return (
		<div>
			<div>{error ? error?.message : null}</div>
			{renderPreview()}
		</div>
	);
};
export default CodePreview;
