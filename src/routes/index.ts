import { RouteConfig } from 'react-router-config';

import ASTEditor from '@/LowCode/ASTEditor';

const routes: RouteConfig[] = [
	{
		path: '/',
		component: ASTEditor,
		routes: [],
	},
];

export default routes;
