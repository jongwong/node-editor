import ReactDOM from 'react-dom';

import App from './App';
import React from 'react';

// @ts-ignore
// const ASTExplorer = React.lazy(() => import('remoteApp/ASTExplorer'));

const Index: React.FC = () => {
	return (
		<div>
			{/*<React.Suspense fallback="Loading...">*/}
			{/*	*/}
			{/*	<ASTExplorer>*/}
			{/*		<Home />*/}
			{/*	</ASTExplorer>*/}
			{/*</React.Suspense>*/}
			<App />
		</div>
	);
};
/* eslint-disable */
ReactDOM.render(<Index />, document.getElementById('root'));
