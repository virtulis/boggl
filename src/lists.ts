import { callToggl } from './call';
import { getOutputType, getWorkspace } from './cli';

const printList = async (list: any[], columns: string[] = ['id', 'name']) => {
	
	const o = getOutputType();
	
	if (o == 'json') return console.log(JSON.stringify(list, null, '  '));
	if (o == 'ids') return console.log(list?.map((row: any) => row.id).join(', '));
	
	const clients = columns.includes('client') && Object.fromEntries((await callToggl(
		`https://api.track.toggl.com/api/v8/workspaces/${getWorkspace()}/clients`
	)).map((row: any) => [row.id, row.name]));
	
	console.table(list?.map((row: any) => Object.fromEntries(columns.map(key => {
		if (key == 'client' && clients) return [key, clients![row.cid]];
		return [key, row[key]];
	}))));
	
};

export async function displayWorkspaces() {
	await printList(await callToggl('https://api.track.toggl.com/api/v8/workspaces'));
}

export async function displayProjects() {
	await printList(
		await callToggl(`https://api.track.toggl.com/api/v8/workspaces/${getWorkspace()}/projects`),
		['id', 'name', 'client'],
	);
}

export async function displayUsers() {
	await printList(
		await callToggl(`https://api.track.toggl.com/api/v8/workspaces/${getWorkspace()}/users`),
		['id', 'email', 'fullname'],
	);
}
