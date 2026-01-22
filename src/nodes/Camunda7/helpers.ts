import { IDataObject } from 'n8n-workflow';

/**
 * Represents a Camunda variable with value and type
 */
interface CamundaVariable {
	value: unknown;
	type: string;
}

/**
 * Collection of Camunda variables keyed by variable name
 */
interface CamundaVariables {
	[key: string]: CamundaVariable;
}

/**
 * Variable input from n8n fixedCollection
 */
interface VariableInput {
	name: string;
	value: string;
	type: string;
}

/**
 * Detects the Camunda type from a JavaScript value
 */
export function detectCamundaType(value: unknown): string {
	if (value === null || value === undefined) {
		return 'String';
	}

	if (typeof value === 'boolean') {
		return 'Boolean';
	}

	if (typeof value === 'number') {
		return Number.isInteger(value) ? 'Integer' : 'Double';
	}

	if (typeof value === 'string') {
		// Check if it's a date string (ISO format)
		if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)) {
			const date = new Date(value);
			if (!isNaN(date.getTime())) {
				return 'Date';
			}
		}
		// Check if it's a JSON string
		if ((value.startsWith('{') && value.endsWith('}')) ||
			(value.startsWith('[') && value.endsWith(']'))) {
			try {
				JSON.parse(value);
				return 'Json';
			} catch {
				// Not valid JSON, treat as string
			}
		}
		return 'String';
	}

	if (value instanceof Date) {
		return 'Date';
	}

	if (typeof value === 'object') {
		return 'Json';
	}

	return 'String';
}

/**
 * Parses a value string based on the specified Camunda type
 */
export function parseValueForType(value: string, type: string): unknown {
	switch (type) {
		case 'Boolean':
			return value.toLowerCase() === 'true';
		case 'Integer':
		case 'Long':
			return parseInt(value, 10);
		case 'Double':
			return parseFloat(value);
		case 'Date':
			return value; // Camunda accepts ISO date strings
		case 'Json':
			try {
				return JSON.parse(value);
			} catch {
				return value;
			}
		default:
			return value;
	}
}

/**
 * Parses the n8n fixedCollection variable input into a simple object
 */
export function parseVariablesInput(variablesInput: IDataObject): IDataObject {
	const variables: IDataObject = {};

	if (variablesInput.variable && Array.isArray(variablesInput.variable)) {
		for (const varItem of variablesInput.variable as VariableInput[]) {
			if (varItem.name) {
				let value: unknown = varItem.value;
				let type = varItem.type;

				// Auto-detect type if not specified
				if (type === 'auto' || !type) {
					type = detectCamundaType(value);
				}

				// Parse the value based on the type
				value = parseValueForType(varItem.value, type);

				variables[varItem.name] = {
					value,
					type,
				};
			}
		}
	}

	return variables;
}

/**
 * Converts a simple JavaScript object to Camunda variable format
 */
export function convertToCamundaVariables(variables: IDataObject): CamundaVariables {
	const result: CamundaVariables = {};

	for (const [key, varData] of Object.entries(variables)) {
		if (varData && typeof varData === 'object' && 'value' in varData && 'type' in varData) {
			// Already in Camunda format from parseVariablesInput
			result[key] = varData as unknown as CamundaVariable;
		} else {
			// Simple value, need to detect type
			result[key] = {
				value: varData,
				type: detectCamundaType(varData),
			};
		}
	}

	return result;
}

/**
 * Converts Camunda variable format back to simple JavaScript object
 */
export function convertFromCamundaVariables(camundaVars: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, varData] of Object.entries(camundaVars)) {
		if (varData && typeof varData === 'object' && 'value' in varData) {
			result[key] = (varData as unknown as CamundaVariable).value as IDataObject;
		} else {
			result[key] = varData;
		}
	}

	return result;
}
