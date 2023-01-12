export const handleError: CallableFunction = (
	error: string | CallableFunction
): void | CallableFunction => {
	if (typeof error === 'function') {
		return (...args: number[]) => {
			throw new Error(error(...args));
		};
	}
	throw new Error(error);
};

export const debounce = (callback: CallableFunction, timeout: number) => {
	if (timeout) {
		let timer: any;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(function (this: any) {
				//@ts-ignore
				callback.apply(this, args);
			}, timeout);
		};
	} else {
		return function (this: any, ...args: any[]) {
			//@ts-ignore
			callback.apply(this, args);
		};
	}
};
export const registerEventListeners = (
	element: any,
	events: {
		[eventName: string]: {
			callback: CallableFunction;
			options: { debounce?: number; [key: string]: any };
		}[];
	} = {}
) => {
	for (let eventName in events) {
		for (let i = 0, iLen = events[eventName].length; i < iLen; i++) {
			let args = events[eventName][i];
			if (args.options?.debounce) {
				args.callback = debounce(args.callback, args.options.debounce);
				delete args.options.debounce;
				element.addEventListener(eventName, args.callback, args.options);
			} //
			else {
				element.addEventListener(eventName, args.callback, args.options);
			}
		}
	}
};

export const deRegisterEventListeners = (
	element: any,
	events: {
		[eventName: string]: {
			callback: CallableFunction;
			options: { [key: string]: any };
		}[];
	} = {}
) => {
	for (let eventName in events) {
		for (let i = 0, iLen = events[eventName].length; i < iLen; i++) {
			let args = events[eventName][i];
			element.removeEventListener(eventName, args.callback, args.options);
		}
	}
};

export const registerTimeouts = (
	timeouts: { callback: CallableFunction; time: number; timeoutId?: number }[]
) => {
	for (let i = 0, iLen = timeouts.length; i < iLen; i++) {
		let timeout = timeouts[i];
		timeout.timeoutId = setTimeout(timeout.callback, timeout.time);
	}
};

export const clearTimeouts = (
	timeouts: { callback: CallableFunction; time: number; timeoutId?: number }[]
) => {
	for (let i = 0, iLen = timeouts.length; i < iLen; i++) {
		clearTimeout(timeouts[i].timeoutId);
	}
};

export const registerIntervals = (
	intervals: { callback: CallableFunction; time: number; intervalId?: number }[]
) => {
	for (let i = 0, iLen = intervals.length; i < iLen; i++) {
		let interval = intervals[i];
		interval.intervalId = setInterval(interval.callback, interval.time);
	}
};
export const clearIntervals = (
	intervals: { callback: CallableFunction; time: number; intervalId?: number }[]
) => {
	for (let i = 0, iLen = intervals.length; i < iLen; i++) {
		clearInterval(intervals[i].intervalId);
	}
};
