import {App, Notice, normalizePath} from 'obsidian';
import {ConfluenceClient} from './api';
import {ConfluencePage, ConfluenceSpace, PageTreeNode} from './types';

/**
 * Handles syncing Confluence content to Obsidian vault
 */
export class ConfluenceSync {
	private app: App;
	private client: ConfluenceClient;
	private rootDir: string;

	constructor(app: App, client: ConfluenceClient, rootDir: string) {
		this.app = app;
		this.client = client;
		this.rootDir = rootDir;
	}

	/**
	 * Build a tree structure from flat page list
	 */
	private buildPageTree(pages: ConfluencePage[]): PageTreeNode[] {
		const pageMap = new Map<string, PageTreeNode>();
		const roots: PageTreeNode[] = [];

		// Create nodes for all pages
		for (const page of pages) {
			pageMap.set(page.id, {page, children: []});
		}

		// Build tree structure
		for (const page of pages) {
			const node = pageMap.get(page.id);
			if (!node) continue;

			if (page.parentId) {
				const parent = pageMap.get(page.parentId);
				if (parent) {
					parent.children.push(node);
				} else {
					// Parent not in this space, treat as root
					roots.push(node);
				}
			} else {
				roots.push(node);
			}
		}

		return roots;
	}

	/**
	 * Sanitize a title to be used as a file/folder name
	 */
	private sanitizeTitle(title: string): string {
		// Remove or replace characters that are invalid in file names
		const sanitized = title
			.replace(/[\\/:*?"<>|]/g, '-')
			.replace(/\s+/g, ' ')
			.trim();
		
		// Handle empty or whitespace-only titles
		return sanitized || 'Untitled';
	}

	/**
	 * Ensure a directory exists, creating it if necessary
	 */
	private async ensureDirectory(path: string): Promise<void> {
		const normalizedPath = normalizePath(path);
		const folder = this.app.vault.getFolderByPath(normalizedPath);
		if (!folder) {
			await this.app.vault.createFolder(normalizedPath);
		}
	}

	/**
	 * Save a page to the vault
	 */
	private async savePage(page: ConfluencePage, dirPath: string): Promise<void> {
		const sanitizedTitle = this.sanitizeTitle(page.title);
		const filePath = normalizePath(`${dirPath}/${sanitizedTitle}.md`);

		// Get the atlas_doc_format content
		const content = page.body?.atlas_doc_format?.value ?? '';

		// Check if file exists
		const existingFile = this.app.vault.getFileByPath(filePath);
		if (existingFile) {
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(filePath, content);
		}
	}

	/**
	 * Recursively save page tree to the vault
	 */
	private async savePageTree(nodes: PageTreeNode[], basePath: string): Promise<number> {
		let count = 0;

		for (const node of nodes) {
			const sanitizedTitle = this.sanitizeTitle(node.page.title);

			if (node.children.length > 0) {
				// Page has children: create a folder for it and put the page content in an index file
				const folderPath = normalizePath(`${basePath}/${sanitizedTitle}`);
				await this.ensureDirectory(folderPath);

				// Save the parent page as index.md in the folder
				const indexPath = normalizePath(`${folderPath}/index.md`);
				const content = node.page.body?.atlas_doc_format?.value ?? '';
				const existingFile = this.app.vault.getFileByPath(indexPath);
				if (existingFile) {
					await this.app.vault.modify(existingFile, content);
				} else {
					await this.app.vault.create(indexPath, content);
				}
				count++;

				// Recursively save children in the folder
				count += await this.savePageTree(node.children, folderPath);
			} else {
				// Leaf page: save directly as a file
				await this.savePage(node.page, basePath);
				count++;
			}
		}

		return count;
	}

	/**
	 * Sync a single space to the vault
	 */
	private async syncSpace(space: ConfluenceSpace): Promise<number> {
		const sanitizedSpaceName = this.sanitizeTitle(space.name);
		const spacePath = normalizePath(`${this.rootDir}/${sanitizedSpaceName}`);

		// Ensure space directory exists
		await this.ensureDirectory(spacePath);

		// Get all pages for this space
		const pages = await this.client.getPagesForSpace(space.id);

		if (pages.length === 0) {
			return 0;
		}

		// Build tree and save
		const tree = this.buildPageTree(pages);
		return await this.savePageTree(tree, spacePath);
	}

	/**
	 * Sync all Confluence content to the vault
	 */
	async syncAll(): Promise<void> {
		new Notice('Starting Confluence sync');

		try {
			// Ensure root directory exists
			await this.ensureDirectory(this.rootDir);

			// Get all spaces
			const spaces = await this.client.getAllSpaces();
			new Notice(`Found ${spaces.length} spaces to sync`);

			let totalPages = 0;

			// Sync each space
			for (const space of spaces) {
				try {
					const pageCount = await this.syncSpace(space);
					totalPages += pageCount;
					new Notice(`Synced "${space.name}": ${pageCount} pages`);
				} catch (error) {
					console.error(`Failed to sync space ${space.name}:`, error);
					new Notice(`Failed to sync space "${space.name}": ${error instanceof Error ? error.message : String(error)}`);
				}
			}

			new Notice(`Confluence sync complete! Synced ${totalPages} pages from ${spaces.length} spaces`);
		} catch (error) {
			console.error('Confluence sync failed:', error);
			new Notice(`Confluence sync failed: ${error instanceof Error ? error.message : String(error)}`);
			throw error;
		}
	}
}
