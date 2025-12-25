import {requestUrl, RequestUrlParam} from 'obsidian';
import {
	ConfluenceSpace,
	ConfluenceSpacesResponse,
	ConfluencePage,
	ConfluencePagesResponse
} from './types';

/**
 * Confluence Cloud API client using Obsidian's requestUrl
 */
export class ConfluenceClient {
	private baseUrl: string;
	private email: string;
	private apiToken: string;

	constructor(baseUrl: string, email: string, apiToken: string) {
		// Normalize base URL (remove trailing slash)
		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.email = email;
		this.apiToken = apiToken;
	}

	private getAuthHeader(): string {
		const credentials = `${this.email}:${this.apiToken}`;
		return `Basic ${btoa(credentials)}`;
	}

	private async request<T>(endpoint: string): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const params: RequestUrlParam = {
			url,
			method: 'GET',
			headers: {
				'Authorization': this.getAuthHeader(),
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		};

		const response = await requestUrl(params);
		return response.json as T;
	}

	/**
	 * Get all spaces from Confluence
	 */
	async getAllSpaces(): Promise<ConfluenceSpace[]> {
		const spaces: ConfluenceSpace[] = [];
		let endpoint = '/wiki/api/v2/spaces?limit=250';

		while (endpoint) {
			const response = await this.request<ConfluenceSpacesResponse>(endpoint);
			spaces.push(...response.results);

			// Handle pagination
			if (response._links?.next) {
				// Extract path from full URL if present
				const nextUrl = response._links.next;
				endpoint = nextUrl.startsWith('http')
					? new URL(nextUrl).pathname + new URL(nextUrl).search
					: nextUrl;
			} else {
				endpoint = '';
			}
		}

		return spaces;
	}

	/**
	 * Get all pages for a specific space
	 */
	async getPagesForSpace(spaceId: string): Promise<ConfluencePage[]> {
		const pages: ConfluencePage[] = [];
		let endpoint = `/wiki/api/v2/spaces/${spaceId}/pages?limit=250&body-format=atlas_doc_format`;

		while (endpoint) {
			const response = await this.request<ConfluencePagesResponse>(endpoint);
			pages.push(...response.results);

			// Handle pagination
			if (response._links?.next) {
				const nextUrl = response._links.next;
				endpoint = nextUrl.startsWith('http')
					? new URL(nextUrl).pathname + new URL(nextUrl).search
					: nextUrl;
			} else {
				endpoint = '';
			}
		}

		return pages;
	}

	/**
	 * Get a single page by ID with its body content
	 */
	async getPageById(pageId: string): Promise<ConfluencePage> {
		const endpoint = `/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`;
		return this.request<ConfluencePage>(endpoint);
	}
}
