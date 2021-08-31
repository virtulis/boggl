import { callToggl, userAgent } from './call';
import * as querystring from 'querystring';
import { getOutputType, getWorkspace } from './cli';
import * as dayjs from 'dayjs';
import { apply, maybe } from './util';
import { TimeEntry } from './types';

const patchLimit = 100;

export interface EntriesOptions {
	since: string;
	until: string;
	query?: string;
	update?: string;
}

export async function searchEntries(options: EntriesOptions) {

	const query = {
		user_agent: userAgent,
		workspace_id: getWorkspace(),
		...maybe(options.query, str => querystring.parse(str)),
		order_desc: 'off',
	};
	
	const since = dayjs(options.since);
	const until = dayjs(options.until);
	
	const data: TimeEntry[] = [];
	let page = 1;
	for (let a = since; a.isBefore(until);) {
	
		const b = apply(a.add(1, 'year'), b => b.isAfter(until) ? until : b);
		const res = await callToggl(`https://api.track.toggl.com/reports/api/v2/details?${querystring.encode({
			...query,
			since: a.format('YYYY-MM-DD'),
			until: b.format('YYYY-MM-DD'),
			page,
		})}`);
		data.push(...res.data);
		
		if (res.data.length == res.per_page) {
			page++;
		}
		else {
			a = a.add(1, 'year');
			page = 1;
		}
		
	}
	
	data.sort((a, b) => a.start.localeCompare(b.start));
	
	return data;
	
}

export async function displayEntries(options: EntriesOptions) {
	const o = getOutputType();
	const entries = await searchEntries(options);
	if (o == 'json') return console.log(JSON.stringify(entries, null, '  '));
	if (o == 'ids') return console.log(entries?.map((row: TimeEntry) => row.id).join(', '));
	console.table(entries);
}

export async function processEntries(options: EntriesOptions) {

	const upStr = options.update?.trim();
	if (!upStr) return await displayEntries(options);
	
	const update = upStr[0] == '{' ? JSON.parse(upStr) : querystring.parse(upStr);
	const entries = await searchEntries(options);
	
	for (let i = 0; i < entries.length; i += patchLimit) {
		await callToggl(
			`https://api.track.toggl.com/api/v8/time_entries/${entries.slice(i, i + patchLimit).map(e => e.id).join(',')}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					time_entry: update
				})
			}
		);
	}
	
}
