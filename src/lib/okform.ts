import type _Element from './_element.js';
import Element from './element.js';
import type { FragmentElement } from './index.js';

type ElementType = _Element | Element | FragmentElement;
type OkFormOpts = {
	name: string;
};
class OKForm {
	_name: string;
	_form: Element;
	constructor({ name }: OkFormOpts) {
		this._name = name;
		this._form = new Element({
			_okform: this,
			_parentElement: null as any,
			_nodeName: 'FORM'
		});
		return this;
	}
	form(): Element {
		return this._form;
	}
}

function okform(name: string): OKForm {
	return new OKForm({ name });
}

export default okform;
export type { OKForm, ElementType };
