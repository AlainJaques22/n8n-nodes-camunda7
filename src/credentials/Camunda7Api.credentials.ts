import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Camunda7Api implements ICredentialType {
	name = 'camunda7Api';
	displayName = 'Camunda 7 API';
	icon = 'file:camunda7.svg' as const;
	documentationUrl = 'https://docs.camunda.org/manual/7.21/reference/rest/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8080/engine-rest',
			placeholder: 'http://localhost:8080/engine-rest',
			description: 'The base URL of the Camunda 7 REST API (without trailing slash)',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for Basic Authentication',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for Basic Authentication',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/engine',
			method: 'GET',
		},
	};
}
