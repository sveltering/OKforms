import type _Element from './_element.js';
import Element from './element.js';
import type { FragmentElement } from './index.js';
import type { z } from 'zod';

type ElementType<Z> = _Element<Z> | Element<Z> | FragmentElement<Z>;
interface OkFormOpts {
	name: string;
}
class OKForm<Z extends {}> {
	_name: string;
	_form!: Element<Z>;
	_formEl!: HTMLFormElement;
	_z!: any;
	_names: string[] = [];
	_errors = {};
	constructor({ name }: OkFormOpts) {
		this._name = name;
		return this;
	}
	form(): Element<Z> {
		if (!this?._form) {
			this._form = new Element<Z>({
				_okform: this,
				_parentElement: null as any,
				_nodeName: 'FORM'
			});
		}
		return this._form;
	}
	zod(z: z.ZodObjectDef) {
		this._z = z;
		return this;
	}
	validate(name?: string) {
		const formData = new FormData(this._formEl);
		if (name && this._z.shape.hasOwnProperty(name)) {
			let response: FormDataEntryValue | FormDataEntryValue[] = formData.getAll(name);
			response = response.length > 1 ? response : response[0];
			return this._z.shape[name].safeParse(response);
		}
		let response: any = {};
		let responseMultiple: string[] = [];
		[...formData.entries()].forEach((val) => {
			let [key, value] = val;
			if (response.hasOwnProperty(key)) {
				if (!responseMultiple.includes(key)) {
					response[key] = [response[key]];
					responseMultiple.push(key);
				}
				response[key].push(value);
			} else {
				response[key] = value;
			}
		});
		return this._z.safeParse(response);
	}
}

function okform<Z>(name: string): OKForm<Z> {
	return new OKForm<Z>({ name });
}

export default okform;
export type { OKForm, ElementType };
