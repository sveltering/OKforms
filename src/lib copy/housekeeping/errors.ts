type T_ErrorMessage = string | CallableFunction;

export const ElementIdentifierAlreadyExists: T_ErrorMessage = (identifier: string) => {
	return `An element has already been created with the identifier "${identifier}"`;
};

export const OneFormOnlyError: T_ErrorMessage = 'There can only be one form element.';

export const AppendArgumentExpects =
	'Append expect element to be a string of a node name, an existing element or fragment';

export const CantRemoveFormElement =
	'Append expect element to be a string of a node name, an existing element or fragment';
