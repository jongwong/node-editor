import EditorLayout from '@/components/EditorLayout';
import PreviewLoading from '@/components/PreviewLoading';
import EsbuildPage from '@/containers/EsbuildPage';
import WebcontainerDemo from '@/containers/WebcontainerDemo';

const routes: any = [
	{
		path: '/run',
		component: EditorLayout,
		routes: [],
	},
	{
		path: '/webcontainer-demo',
		component: WebcontainerDemo,
		routes: [],
	},
	{
		path: '/preview-loading',
		component: PreviewLoading,
		routes: [],
	},
	{
		path: '/esbuild-demo',
		component: EsbuildPage,
		routes: [],
	},
];

export default routes;
