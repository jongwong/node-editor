import { RouteConfig } from 'react-router-config';

import ASTEditor from '@/ASTEditor';
import ASTExplorer from '@/ASTEditor/ASTExplorer';
import NodeEditor from '@/NodeEditor/NodeEditor';

const routes: RouteConfig[] = [
	{
		path: '/node',
		component: NodeEditor,
		routes: [],
	},
	{
		path: '/ast',
		component: ASTEditor,
		routes: [],
	},
	{
		path: '/ast-explorer',
		component: ASTExplorer,
		routes: [],
	},
];

export default routes;
