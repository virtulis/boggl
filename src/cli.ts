#!/usr/bin/env node

import { program } from 'commander';
import { displayProjects, displayUsers, displayWorkspaces } from './lists';
import { processEntries } from './entries';
import * as dayjs from 'dayjs';

function increaseVerbosity(dummyValue: any, previous: number) {
	return previous + 1;
}

export type OutputType = 'table' | 'json' | 'ids';
let outputType: OutputType = 'table';
export const getOutputType = () => outputType;

export const getWorkspace = () => {
	const wid = program.getOptionValue('workspace') || process.env.TOGGL_WORKSPACE;
	if (wid) return wid;
	program.outputHelp();
	throw new Error('Workspace is required');
}

async function main() {

	program
		.showHelpAfterError()
		.requiredOption(
			'-t, --token <value>',
			'Toggl API token. TOGGL_TOKEN from environment used by default.',
			process.env.TOGGL_TOKEN,
		)
		.option('-w, --workspace <value>', 'Workspace ID (required for everything but workspaces). TOGGL_WORKSPACE used by default.')
		.option('-v, --verbose', 'Verbose output (repeat for more)', increaseVerbosity, 0)
		.option('-j, --json', 'Show as JSON', () => outputType = 'json')
		.option('-i, --ids', 'Show ID(s) only', () => outputType = 'ids');
	
	program
		.command('workspaces')
		.description('List workspaces')
		.action(displayWorkspaces);
	program
		.command('projects')
		.description('List projects in workspace')
		.action(displayProjects);
	program
		.command('users')
		.description('List users in workspace')
		.action(displayUsers);
	
	program
		.command('entries')
		.description('List or edit time entries')
		.option('-q, --query <value>', 'Query string (without ?, workspace or dates', '')
		.option('--since <value>', 'Start date', dayjs().add(1, 'day').subtract(1, 'year').format('YYYY-MM-DD'))
		.option('--until <value>', 'End date', dayjs().add(1, 'day').format('YYYY-MM-DD'))
		.option('--update <value>', 'Update (JSON object or query string)', '')
		.action(processEntries);
		
	await program.parseAsync(process.argv);
	
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
