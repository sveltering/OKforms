import { writable, get } from 'svelte/store';

export abstract class CustomStore<T> {
	protected _store: any;
	protected _unsubscribes: (CallableFunction | null)[] = [];

	constructor(value: T) {
		return this.init(value);
	}

	protected makeStore(value: T) {
		let _this = this;
		this._store = writable<T>(value, function start() {
			return function stop() {
				_this._unsubscribes = [];
			};
		});
		return this;
	}

	protected init(value: T): this {
		return this.makeStore(value);
	}

	protected _get(): T {
		return get(this._store);
	}
	protected _set(value: T): this {
		this._store.set(value);
		return this;
	}

	subscribe(callback: CallableFunction): CallableFunction {
		let unsubscribe: CallableFunction = this._store.subscribe(callback);
		let unsubscribeIndex = this._unsubscribes.length;
		this._unsubscribes.push(unsubscribe);
		return () => {
			if (typeof this._unsubscribes?.[unsubscribeIndex] === 'function') {
				unsubscribe();
				this._unsubscribes[unsubscribeIndex] = null;
			}
		};
	}
	destroy(): void {
		for (let i = 0, iLen = this._unsubscribes.length; i < iLen; i++) {
			if (typeof this._unsubscribes?.[i] === 'function') {
				//@ts-ignore
				this._unsubscribes[i]();
				this._unsubscribes[i] = null;
			}
		}
		let properties = Object.getOwnPropertyNames(this);

		for (let i = 0, iLen = properties.length; i < iLen; i++) {
			//@ts-ignore
			this[properties[i]] = null;
			//@ts-ignore
			delete this[properties[i]];
		}
	}

	store() {
		return this._store;
	}
}

type keyValue<C> = { [key: string]: C };

export class keyValueStore<C> extends CustomStore<keyValue<C>> {
	constructor(value: keyValue<C> = {}) {
		super(value);
		return this;
	}
	protected init(value: keyValue<C> = {}): this {
		return this.makeStore(value);
	}
	get(key: string) {
		return this._get()?.[key];
	}
	getAll() {
		return this._get();
	}
	setAll(keyValue: keyValue<C>): this {
		return this._set({
			...this._get(),
			...keyValue
		});
	}
	replaceAll(keyValue: keyValue<C>): this {
		return this._set(keyValue);
	}
	delete(key: string): this {
		let keyValue: keyValue<C> = this._get();
		delete keyValue[key];
		return this._set(keyValue);
	}
	deleteAll(): this {
		return this._set({});
	}
	keys(): string[] {
		return Object.keys(this._get());
	}
	hasKey(key: string): boolean {
		return this._get().hasOwnProperty(key);
	}
	pluck(key: string): any {
		let keyValue: keyValue<C> = this._get();
		let plucked = keyValue[key];
		delete keyValue[key];
		return this._set(keyValue);
	}
}
export class arrayStore<A> extends CustomStore<A[]> {
	constructor(value: A[] = []) {
		super(value);
		return this;
	}
	protected init(value: A[] = []): this {
		return this.makeStore(value);
	}
	unshift(...args: A[]): this {
		let array = this._get();
		array.unshift(...args);
		return this._set(array);
	}
	push(...args: A[]): this {
		let array = this._get();
		array.push(...args);
		return this._set(array);
	}

	protected _insert_index(after: boolean = true, needleIndex: number, ...values: A[]): this {
		if (needleIndex < 0) {
			return this;
		}
		let array = this._get();
		let sliceFrom = after ? needleIndex + 1 : needleIndex;

		let array1 = array.slice(0, sliceFrom);
		let array2 = array.slice(sliceFrom);
		return this._set([...array1, ...values, ...array2]);
	}

	protected _insert(after: boolean = true, first: boolean = true, needle: A, ...values: A[]): this {
		let array = this._get();
		let needleIndex = first ? array.indexOf(needle) : array.lastIndexOf(needle);
		return this._insert_index(after, needleIndex, ...values);
	}

	addAfter(needle: A, ...values: A[]): this {
		return this._insert(true, true, needle, ...values);
	}
	addBefore(needle: A, ...values: A[]): this {
		return this._insert(false, true, needle, ...values);
	}
	addAfterLast(needle: A, ...values: A[]): this {
		return this._insert(true, false, needle, ...values);
	}
	addBeforeLast(needle: A, ...values: A[]): this {
		return this._insert(false, false, needle, ...values);
	}

	addAfterIndex(needleIndex: number, ...values: A[]): this {
		return this._insert_index(true, needleIndex, ...values);
	}
	addBeforeIndex(needleIndex: number, ...values: A[]): this {
		return this._insert_index(false, needleIndex, ...values);
	}
	removeFirst(value: A): this {
		let array = this._get();
		let index = array.indexOf(value);
		if (index > -1) {
			array.splice(index, 1);
			return this._set(array);
		}
		return this;
	}
	removeLast(value: A): this {
		let array = this._get();
		let index = array.lastIndexOf(value);
		if (index > -1) {
			array.splice(index, 1);
			return this._set(array);
		}
		return this;
	}
	removeEvery(value: A): this {
		let array = this._get();
		array = array.filter((x: A) => x !== value);
		return this._set(array);
	}

	includes(value: A): boolean {
		return this._get().includes(value);
	}
	getAll() {
		return this._get();
	}
	replaceAll(array: A[]): this {
		return this._set(array);
	}

	delete(index: number): this {
		let array = this._get();
		let plucked = array.splice(index, 1);
		return this._set(array);
	}
	deleteAll(): this {
		return this._set([]);
	}

	pluck(index: number): A | void {
		let array = this._get();
		let plucked = array.splice(index, 1);
		this._set(array);
		return plucked.length ? plucked[0] : undefined;
	}
	get length(): number {
		return this._get().length;
	}
}

export class singleStore<B> extends CustomStore<B> {
	get(): B {
		return get(this._store);
	}
	set(value: B): this {
		return this._store.set(value);
	}
	update(callback: CallableFunction): this {
		this._store.update(callback);
		return this;
	}
}

/*
export const keyValueStore = (value: keyValue = {}): _keyValueStore => {
	return new _keyValueStore(value);
};

export const arrayStore = <A>(value: A[] = []): _arrayStore<A> => {
	return new _arrayStore<A>(value);
};

export const singleStore = <B>(value: B): _singleStore<B> => {
	return new _singleStore<B>(value);
};
*/
