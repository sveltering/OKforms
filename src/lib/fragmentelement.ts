import type { OKForm } from './okform.js';
import _Element from './_element.js';
import type Element from './element.js';
import { writableStore } from '@sveltering/custom-store';

type lifeCycleEvents = 'mount' | 'destroy' | 'afterUpdate' | 'beforeUpdate';

type FragmentElementOpts<Z> = {
	_okform: OKForm<Z>;
	_parentElement: Element<Z>;
};
class FragmentElement<Z> extends _Element<Z> {
	_isFragment: boolean = true;

	constructor({ _okform, _parentElement }: FragmentElementOpts<Z>) {
		super();
		this._okform = _okform;
		this._parentElement = _parentElement;
		this.$innerHTML = writableStore('');
		this.$innerText = writableStore('');
		return this;
	}

	empty(): this {
		this.$innerText.value = false;
		this.$innerHTML.value = false;

		return this;
	}
	html(_innerHTML: string) {
		this.$innerText.value = false;
		this.$innerHTML.value = _innerHTML;
		return this;
	}
	text(_innerText: string) {
		this.$innerHTML.value = false;
		this.$innerText.value = _innerText;
		return this;
	}
	on(event: lifeCycleEvents, callback: CallableFunction, options: {} = {}): this {
		if (!this._events.hasOwnProperty(event)) {
			this._events[event] = [];
		}
		this._events[event].push({ callback, options });
		return this;
	}
}

export default FragmentElement;
export type { FragmentElementOpts };
