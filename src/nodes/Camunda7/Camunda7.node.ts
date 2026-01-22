import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IDataObject,
} from 'n8n-workflow';

import {
	convertToCamundaVariables,
	convertFromCamundaVariables,
	parseVariablesInput,
} from './helpers';

export class Camunda7 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Camunda 7',
		name: 'camunda7',
		icon: 'file:camunda7.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Camunda 7 BPM Platform',
		defaults: {
			name: 'Camunda 7',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'camunda7Api',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Process Definition',
						value: 'processDefinition',
					},
					{
						name: 'Process Instance',
						value: 'processInstance',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Message',
						value: 'message',
					},
				],
				default: 'processDefinition',
			},

			// Operations for Process Definition
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['processDefinition'],
					},
				},
				options: [
					{
						name: 'Start Instance',
						value: 'startInstance',
						description: 'Start a new process instance by process definition key',
						action: 'Start a process instance',
					},
				],
				default: 'startInstance',
			},

			// Operations for Process Instance
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['processInstance'],
					},
				},
				options: [
					{
						name: 'Get Variables',
						value: 'getVariables',
						description: 'Get all variables of a process instance',
						action: 'Get process instance variables',
					},
				],
				default: 'getVariables',
			},

			// Operations for Task
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Complete',
						value: 'complete',
						description: 'Complete a user task',
						action: 'Complete a task',
					},
					{
						name: 'Query',
						value: 'query',
						description: 'Query tasks by filters',
						action: 'Query tasks',
					},
				],
				default: 'complete',
			},

			// Operations for Message
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send',
						value: 'send',
						description: 'Correlate a message to a process',
						action: 'Send a message',
					},
				],
				default: 'send',
			},

			// ============================================
			// Process Definition - Start Instance Fields
			// ============================================
			{
				displayName: 'Process Definition Key',
				name: 'processDefinitionKey',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['processDefinition'],
						operation: ['startInstance'],
					},
				},
				description: 'The key of the process definition to start (from the BPMN file)',
			},
			{
				displayName: 'Business Key',
				name: 'businessKey',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['processDefinition'],
						operation: ['startInstance'],
					},
				},
				description: 'A business key to associate with the process instance',
			},
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['processDefinition'],
						operation: ['startInstance'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the variable',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the variable',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'Auto-Detect', value: 'auto' },
									{ name: 'String', value: 'String' },
									{ name: 'Integer', value: 'Integer' },
									{ name: 'Long', value: 'Long' },
									{ name: 'Double', value: 'Double' },
									{ name: 'Boolean', value: 'Boolean' },
									{ name: 'Date', value: 'Date' },
									{ name: 'JSON', value: 'Json' },
								],
								default: 'auto',
								description: 'The type of the variable (auto-detect will infer from value)',
							},
						],
					},
				],
				description: 'Variables to pass to the process instance',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						resource: ['processDefinition'],
						operation: ['startInstance'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'With Variables in Return',
						name: 'withVariablesInReturn',
						type: 'boolean',
						default: false,
						description: 'Whether to include all process variables in the response. When enabled, you don\'t need a separate "Get Variables" call.',
					},
				],
			},

			// ============================================
			// Process Instance - Get Variables Fields
			// ============================================
			{
				displayName: 'Process Instance ID',
				name: 'processInstanceId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['processInstance'],
						operation: ['getVariables'],
					},
				},
				description: 'The ID of the process instance',
			},
			{
				displayName: 'Deserialize Values',
				name: 'deserializeValues',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['processInstance'],
						operation: ['getVariables'],
					},
				},
				description: 'Whether to deserialize variable values',
			},

			// ============================================
			// Task - Complete Fields
			// ============================================
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['complete'],
					},
				},
				description: 'The ID of the task to complete',
			},
			{
				displayName: 'Variables',
				name: 'taskVariables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['complete'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the variable',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the variable',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'Auto-Detect', value: 'auto' },
									{ name: 'String', value: 'String' },
									{ name: 'Integer', value: 'Integer' },
									{ name: 'Long', value: 'Long' },
									{ name: 'Double', value: 'Double' },
									{ name: 'Boolean', value: 'Boolean' },
									{ name: 'Date', value: 'Date' },
									{ name: 'JSON', value: 'Json' },
								],
								default: 'auto',
								description: 'The type of the variable',
							},
						],
					},
				],
				description: 'Variables to set when completing the task',
			},

			// ============================================
			// Task - Query Fields
			// ============================================
			{
				displayName: 'Process Instance ID',
				name: 'queryProcessInstanceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['query'],
					},
				},
				description: 'Filter tasks by process instance ID',
				placeholder: 'e.g., abc-123-def-456',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['query'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Assignee',
						name: 'assignee',
						type: 'string',
						default: '',
						description: 'Filter by task assignee username',
					},
					{
						displayName: 'Task Definition Key',
						name: 'taskDefinitionKey',
						type: 'string',
						default: '',
						description: 'Filter by task definition key from BPMN',
					},
					{
						displayName: 'Task Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Filter by task name',
					},
				],
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['query'],
					},
				},
				default: true,
				description: 'Whether to return all results or limit to a specific number',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['query'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// ============================================
			// Message - Send Fields
			// ============================================
			{
				displayName: 'Message Name',
				name: 'messageName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				description: 'The name of the message to correlate (as defined in the BPMN)',
			},
			{
				displayName: 'Correlation Options',
				name: 'correlationOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				options: [
					{
						displayName: 'Business Key',
						name: 'businessKey',
						type: 'string',
						default: '',
						description: 'Correlate to process instances with this business key',
					},
					{
						displayName: 'Process Instance ID',
						name: 'processInstanceId',
						type: 'string',
						default: '',
						description: 'Correlate to a specific process instance by ID',
					},
					{
						displayName: 'Result Enabled',
						name: 'resultEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether to return the process instance and variables in the response',
					},
				],
			},
			{
				displayName: 'Process Variables',
				name: 'messageVariables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the variable',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the variable',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'Auto-Detect', value: 'auto' },
									{ name: 'String', value: 'String' },
									{ name: 'Integer', value: 'Integer' },
									{ name: 'Long', value: 'Long' },
									{ name: 'Double', value: 'Double' },
									{ name: 'Boolean', value: 'Boolean' },
									{ name: 'Date', value: 'Date' },
									{ name: 'JSON', value: 'Json' },
								],
								default: 'auto',
								description: 'The type of the variable',
							},
						],
					},
				],
				description: 'Variables to pass with the message',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('camunda7Api');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				// ============================================
				// Process Definition - Start Instance
				// ============================================
				if (resource === 'processDefinition' && operation === 'startInstance') {
					const processDefinitionKey = this.getNodeParameter('processDefinitionKey', i) as string;
					const businessKey = this.getNodeParameter('businessKey', i, '') as string;
					const variablesInput = this.getNodeParameter('variables', i, {}) as IDataObject;
					const options = this.getNodeParameter('options', i, {}) as IDataObject;

					const variables = parseVariablesInput(variablesInput);
					const camundaVariables = convertToCamundaVariables(variables);

					const body: IDataObject = {
						variables: camundaVariables,
					};

					if (businessKey) {
						body.businessKey = businessKey;
					}

					// Add withVariablesInReturn to request body (not query string)
					if (options.withVariablesInReturn === true) {
						body.withVariablesInReturn = true;
					}

					responseData = await this.helpers.httpRequest({
						method: 'POST' as IHttpRequestMethods,
						url: `${baseUrl}/process-definition/key/${encodeURIComponent(processDefinitionKey)}/start`,
						body,
						json: true,
					});
				}

				// ============================================
				// Process Instance - Get Variables
				// ============================================
				else if (resource === 'processInstance' && operation === 'getVariables') {
					const processInstanceId = this.getNodeParameter('processInstanceId', i) as string;
					const deserializeValues = this.getNodeParameter('deserializeValues', i, true) as boolean;

					const camundaResponse = await this.helpers.httpRequest({
						method: 'GET' as IHttpRequestMethods,
						url: `${baseUrl}/process-instance/${encodeURIComponent(processInstanceId)}/variables`,
						qs: {
							deserializeValues,
						},
						json: true,
					});

					// Convert Camunda variable format to simple key-value pairs
					responseData = convertFromCamundaVariables(camundaResponse as IDataObject);
				}

				// ============================================
				// Task - Complete
				// ============================================
				else if (resource === 'task' && operation === 'complete') {
					const taskId = this.getNodeParameter('taskId', i) as string;
					const variablesInput = this.getNodeParameter('taskVariables', i, {}) as IDataObject;

					const variables = parseVariablesInput(variablesInput);
					const camundaVariables = convertToCamundaVariables(variables);

					const body: IDataObject = {
						variables: camundaVariables,
					};

					await this.helpers.httpRequest({
						method: 'POST' as IHttpRequestMethods,
						url: `${baseUrl}/task/${encodeURIComponent(taskId)}/complete`,
						body,
						json: true,
					});

					responseData = { success: true, taskId };
				}

				// ============================================
				// Task - Query
				// ============================================
				else if (resource === 'task' && operation === 'query') {
					const processInstanceId = this.getNodeParameter('queryProcessInstanceId', i, '') as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
					const returnAll = this.getNodeParameter('returnAll', i, true) as boolean;

					// Build query parameters
					const qs: IDataObject = {};

					if (processInstanceId) {
						qs.processInstanceId = processInstanceId;
					}

					if (additionalFields.assignee) {
						qs.assignee = additionalFields.assignee;
					}

					if (additionalFields.taskDefinitionKey) {
						qs.taskDefinitionKey = additionalFields.taskDefinitionKey;
					}

					if (additionalFields.name) {
						qs.name = additionalFields.name;
					}

					if (!returnAll) {
						const limit = this.getNodeParameter('limit', i, 50) as number;
						qs.maxResults = limit;
					}

					// Make API request
					responseData = await this.helpers.httpRequest({
						method: 'GET' as IHttpRequestMethods,
						url: `${baseUrl}/task`,
						qs,
						json: true,
					});

					// Response is already an array
					if (!Array.isArray(responseData)) {
						responseData = [responseData];
					}
				}

				// ============================================
				// Message - Send
				// ============================================
				else if (resource === 'message' && operation === 'send') {
					const messageName = this.getNodeParameter('messageName', i) as string;
					const correlationOptions = this.getNodeParameter('correlationOptions', i, {}) as IDataObject;
					const variablesInput = this.getNodeParameter('messageVariables', i, {}) as IDataObject;

					const variables = parseVariablesInput(variablesInput);
					const camundaVariables = convertToCamundaVariables(variables);

					const body: IDataObject = {
						messageName,
						processVariables: camundaVariables,
					};

					if (correlationOptions.businessKey) {
						body.businessKey = correlationOptions.businessKey;
					}

					if (correlationOptions.processInstanceId) {
						body.processInstanceId = correlationOptions.processInstanceId;
					}

					if (correlationOptions.resultEnabled) {
						body.resultEnabled = correlationOptions.resultEnabled;
					}

					responseData = await this.helpers.httpRequest({
						method: 'POST' as IHttpRequestMethods,
						url: `${baseUrl}/message`,
						body,
						json: true,
					});

					// If no result was requested, the response may be empty
					if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
						responseData = { success: true, messageName };
					}
				} else {
					throw new Error(`Unknown resource/operation: ${resource}/${operation}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
