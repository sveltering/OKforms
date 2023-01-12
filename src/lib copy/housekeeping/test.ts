import { browser } from '$app/environment';
import { tick } from 'svelte';

let delay: number = 0;
let currentTest: number = 0;
let tests: { title: string; callback: CallableFunction; delayIncrement: number }[] = [];

const printTitle = (title: string, prependStr: string = 'Test: ') => {
	console.log(
		'%c' + prependStr + title,
		'background: #222; color: #bada55; font-weight:bold; padding:2px;'
	);
};

const runNext = () => {
	currentTest += 1;
	if (currentTest <= tests.length) {
		runTests();
		console.log('');
	}
};

let successCount = 0;
const success = (message: string = 'Test outcome: success') => {
	console.log('%c' + message, 'background: green; color: white; font-weight:bold; padding:2px;');
	successCount++;
	runNext();
};
let failCount = 0;
const fail = (message: string = 'Test outcome: failed') => {
	console.log('%c' + message, 'background: red; color: white; font-weight:bold; padding:2px;');
	failCount++;
	runNext();
};
const addDelay = (time: number) => {
	delay += time;
};

const sleep = async (time: number) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};
export const test = (
	title: string,
	callback: CallableFunction,
	delayIncrement: number = 0
): void => {
	if (!browser) return;
	tests.push({ title, callback, delayIncrement });
};

export const runTests = () => {
	if (!browser) return;
	if (currentTest === tests.length) {
		console.log('');
		console.log('');
		printTitle('🏁 All ' + tests.length + ' tests complete 🏁', '');
		success(successCount + ' tests were successful');
		(failCount ? fail : success)(failCount + ' tests failed' + (failCount ? ' 🏳🏳🏳' : ' 🎉🎉🎉'));
		return;
	}
	let { title, callback, delayIncrement } = tests[currentTest];
	delay += delayIncrement;
	setTimeout(() => {
		printTitle(title);
		callback({ success, fail, tick, sleep, addDelay });
	}, delay);
};
