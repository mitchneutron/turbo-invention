/**
 * Confluence API response types
 */

export interface ConfluenceSpace {
	id: string;
	key: string;
	name: string;
	type: string;
}

export interface ConfluenceSpacesResponse {
	results: ConfluenceSpace[];
	_links?: {
		next?: string;
	};
}

export interface ConfluencePage {
	id: string;
	title: string;
	spaceId: string;
	parentId?: string;
	status: string;
	body?: {
		atlas_doc_format?: {
			value: string;
			representation: string;
		};
	};
	_links?: {
		webui?: string;
	};
}

export interface ConfluencePagesResponse {
	results: ConfluencePage[];
	_links?: {
		next?: string;
	};
}

export interface PageTreeNode {
	page: ConfluencePage;
	children: PageTreeNode[];
}
