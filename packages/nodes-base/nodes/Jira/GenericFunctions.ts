import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IExecuteSingleFunctions,
	BINARY_ENCODING
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

export async function jiraSoftwareCloudApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, endpoint: string, method: string, body: any = {}, query?: IDataObject, uri?: string): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('jiraSoftwareCloudApi');
	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}
	const data = Buffer.from(`${credentials!.email}:${credentials!.apiToken}`).toString(BINARY_ENCODING);
	const headerWithAuthentication = Object.assign({},
		{ Authorization: `Basic ${data}`, Accept: 'application/json', 'Content-Type': 'application/json' });
	const options: OptionsWithUri = {
		headers: headerWithAuthentication,
		method,
		qs: query,
		uri: uri || `${credentials.domain}/rest/api/2${endpoint}`,
		body,
		json: true
	};

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		const errorMessage =
		 error.response.body.message || error.response.body.Message;

		if (errorMessage !== undefined) {
			throw errorMessage;
		}
		throw error.response.body;
	}
}



/**
 * Make an API request to paginated intercom endpoint
 * and return all results
 */
export async function jiraSoftwareCloudApiRequestAllItems(this: IHookFunctions | IExecuteFunctions, propertyName: string, endpoint: string, method: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	query.maxResults = 100;

	let uri: string | undefined;

	do {
		responseData = await jiraSoftwareCloudApiRequest.call(this, endpoint, method, body, query, uri);
		uri = responseData.nextPage;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		responseData.isLast !== false &&
		responseData.nextPage !== undefined &&
		responseData.nextPage !== null
	);

	return returnData;
}


export function validateJSON(json: string | undefined): any { // tslint:disable-line:no-any
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = '';
	}
	return result;
}
