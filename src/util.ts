export function maybe<IT, RT>(it: IT, action: (it: Exclude<IT, undefined | null>) => RT): (RT | undefined) {
	if (it === null || it === undefined) return undefined;
	return action(it!);
}

export function apply<A, R>(it: A, action: (it: A) => R): R;
export function apply<A, B, R>(a: A, b: B, action: (a: A, b: B) => R): R;
export function apply<A, B, C, R>(a: A, b: B, c: C, action: (a: A, b: B, c: C) => R): R;
export function apply<A, B, C, D, R>(a: A, b: B, c: C, d: D, action: (a: A, b: B, c: C, d: D) => R): R;
export function apply(...args: any[]) {
	const action = args.pop();
	return action(...args);
}
