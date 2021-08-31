import fetchImpl, { RequestInit } from 'node-fetch';
import { program } from 'commander';

export const userAgent = 'Boggl (danko@very.lv)';

export async function callToggl(
	url: string,
	init?: RequestInit & { headers?: Record<string, string> },
	attempt = 1,
): Promise<any> {

	const verb = program.getOptionValue('verbose');
	
	if (verb >= 1) console.warn(`-> ${init?.method?.toUpperCase() || 'GET'} ${url}`)
	const auth = `Basic ${Buffer.from(`${program.getOptionValue('token')}:api_token`).toString('base64')}`;
	
	if (verb >= 2 && init?.body) console.log(init.body);
	const res = await fetchImpl(url, {
		...init,
		headers: {
			...init?.headers,
			'User-Agent': userAgent,
			Authorization: auth
		},
	});
	
	if (verb >= 1) console.warn(`<- ${res.status} ${res.statusText} (${res.size})`);
	if (res.status == 429 || res.status >= 500) {
		const ms = attempt * (res.status >= 500 ? 5000 : 500);
		console.warn(`${res.status > 500 ? res.statusText : 'Throttled'}... wait ${ms}ms`);
		await new Promise<void>(resolve => setTimeout(resolve, ms));
		return callToggl(url, init, attempt + 1);
	}
	if (res.status >= 400) {
		throw new Error(`${res.statusText} at ${url}`);
	}
	
	const json = await res.json();
	if (verb >= 2) console.log(JSON.stringify(json, null, '  '));
	
	return json;
	
}
