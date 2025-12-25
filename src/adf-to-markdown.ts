/**
 * ADF to Obsidian Markdown Converter
 * 
 * Converts Atlassian Document Format (ADF) to Obsidian-compatible Markdown.
 * Based on:
 * - ADF spec: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 * - Obsidian Markdown: https://help.obsidian.md/
 */

import type {
	ADFDocument,
	ADFMark,
	ADFNode,
	BlockquoteNode,
	BulletListNode,
	CodeBlockNode,
	DateNode,
	DecisionItemNode,
	DecisionListNode,
	EmojiNode,
	ExpandNode,
	HeadingNode,
	InlineCardNode,
	ListItemNode,
	MediaNode,
	MediaSingleNode,
	MentionNode,
	OrderedListNode,
	PanelNode,
	StatusNode,
	TableCellNode,
	TableHeaderNode,
	TableNode,
	TableRowNode,
	TaskItemNode,
	TaskListNode,
	TextNode,
} from './adf-types';

/**
 * Options for the ADF to Markdown conversion.
 */
export interface ADFToMarkdownOptions {
	/**
	 * Whether to include a comment for unsupported features.
	 * Default: true
	 */
	includeUnsupportedComments?: boolean;

	/**
	 * Custom handler for media URLs (e.g., to resolve Confluence attachment URLs).
	 * If not provided, uses the raw URL or a placeholder.
	 */
	mediaUrlResolver?: (mediaNode: MediaNode) => string;

	/**
	 * Custom handler for mention resolution (e.g., to convert user IDs to names).
	 * If not provided, uses the text attribute or the ID.
	 */
	mentionResolver?: (mentionNode: MentionNode) => string;
}

/**
 * Converts Atlassian Document Format (ADF) to Obsidian-compatible Markdown.
 */
export class ADFToMarkdownConverter {
	private options: Required<ADFToMarkdownOptions>;

	constructor(options: ADFToMarkdownOptions = {}) {
		this.options = {
			includeUnsupportedComments: options.includeUnsupportedComments ?? true,
			mediaUrlResolver: options.mediaUrlResolver ?? this.defaultMediaUrlResolver.bind(this),
			mentionResolver: options.mentionResolver ?? this.defaultMentionResolver.bind(this),
		};
	}

	/**
	 * Convert an ADF document to Obsidian Markdown.
	 * @param adf - The ADF document to convert
	 * @returns The converted Markdown string
	 */
	convert(adf: ADFDocument): string {
		if (!adf || adf.type !== 'doc' || !Array.isArray(adf.content)) {
			return '';
		}

		const result = this.convertNodes(adf.content);
		return result.trim();
	}

	/**
	 * Convert an array of ADF nodes to Markdown.
	 */
	private convertNodes(nodes: ADFNode[], context: ConversionContext = {}): string {
		return nodes.map(node => this.convertNode(node, context)).join('');
	}

	/**
	 * Convert a single ADF node to Markdown.
	 */
	private convertNode(node: ADFNode, context: ConversionContext = {}): string {
		switch (node.type) {
			// Block nodes
			case 'paragraph':
				return this.convertParagraph(node, context);
			case 'heading':
				return this.convertHeading(node as HeadingNode);
			case 'blockquote':
				return this.convertBlockquote(node as BlockquoteNode);
			case 'codeBlock':
				return this.convertCodeBlock(node as CodeBlockNode);
			case 'bulletList':
				return this.convertBulletList(node as BulletListNode, context);
			case 'orderedList':
				return this.convertOrderedList(node as OrderedListNode, context);
			case 'rule':
				return this.convertRule();
			case 'table':
				return this.convertTable(node as TableNode);
			case 'panel':
				return this.convertPanel(node as PanelNode);
			case 'expand':
			case 'nestedExpand':
				return this.convertExpand(node as ExpandNode);
			case 'mediaSingle':
			case 'mediaGroup':
				return this.convertMediaSingle(node as MediaSingleNode);
			case 'taskList':
				return this.convertTaskList(node as TaskListNode, context);
			case 'decisionList':
				return this.convertDecisionList(node as DecisionListNode, context);
			case 'layoutSection':
				return this.convertLayoutSection(node);

			// Inline nodes
			case 'text':
				return this.convertText(node as TextNode);
			case 'hardBreak':
				return this.convertHardBreak();
			case 'mention':
				return this.convertMention(node as MentionNode);
			case 'emoji':
				return this.convertEmoji(node as EmojiNode);
			case 'date':
				return this.convertDate(node as DateNode);
			case 'status':
				return this.convertStatus(node as StatusNode);
			case 'inlineCard':
				return this.convertInlineCard(node as InlineCardNode);

			// Extension/macro nodes (stubs)
			case 'bodiedExtension':
			case 'extension':
			case 'inlineExtension':
				return this.convertExtension(node);

			// Other/unknown
			default:
				return this.convertUnsupported(node);
		}
	}

	// ==================== Block Node Converters ====================

	private convertParagraph(node: ADFNode, context: ConversionContext): string {
		const content = node.content ? this.convertNodes(node.content, context) : '';
		// Don't add extra newlines if we're inside a list item or table cell
		if (context.inListItem || context.inTableCell) {
			return content;
		}
		return content + '\n\n';
	}

	private convertHeading(node: HeadingNode): string {
		const level = node.attrs?.level ?? 1;
		const prefix = '#'.repeat(level);
		const content = node.content ? this.convertNodes(node.content) : '';
		return `${prefix} ${content}\n\n`;
	}

	private convertBlockquote(node: BlockquoteNode): string {
		const content = node.content ? this.convertNodes(node.content) : '';
		// Prefix each line with >
		const lines = content.trim().split('\n');
		const quoted = lines.map(line => `> ${line}`).join('\n');
		return quoted + '\n\n';
	}

	private convertCodeBlock(node: CodeBlockNode): string {
		const language = node.attrs?.language ?? '';
		const content = node.content
			? node.content.map(n => (n as TextNode).text ?? '').join('')
			: '';
		return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
	}

	private convertBulletList(node: BulletListNode, context: ConversionContext): string {
		const items = node.content ?? [];
		const result = items
			.map(item => this.convertListItem(item, '-', context))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}

	private convertOrderedList(node: OrderedListNode, context: ConversionContext): string {
		const items = node.content ?? [];
		const startOrder = node.attrs?.order ?? 1;
		const result = items
			.map((item, index) => this.convertListItem(item, `${startOrder + index}.`, context))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}

	private convertListItem(node: ListItemNode, prefix: string, context: ConversionContext): string {
		const indent = '  '.repeat(context.listDepth ?? 0);
		const newContext: ConversionContext = {
			...context,
			inListItem: true,
			listDepth: (context.listDepth ?? 0) + 1,
		};

		const contentParts: string[] = [];
		let firstParagraph = true;

		for (const child of node.content ?? []) {
			if (child.type === 'paragraph') {
				const paragraphContent = child.content ? this.convertNodes(child.content, newContext) : '';
				if (firstParagraph) {
					contentParts.push(`${indent}${prefix} ${paragraphContent}\n`);
					firstParagraph = false;
				} else {
					contentParts.push(`${indent}  ${paragraphContent}\n`);
				}
			} else if (child.type === 'bulletList' || child.type === 'orderedList') {
				contentParts.push(this.convertNode(child, newContext));
			} else {
				const converted = this.convertNode(child, newContext);
				if (firstParagraph) {
					contentParts.push(`${indent}${prefix} ${converted}\n`);
					firstParagraph = false;
				} else {
					contentParts.push(converted);
				}
			}
		}

		return contentParts.join('');
	}

	private convertRule(): string {
		return '---\n\n';
	}

	private convertTable(node: TableNode): string {
		const rows = node.content ?? [];
		if (rows.length === 0) return '';

		const tableRows: string[][] = [];
		let headerRowIndex = -1;

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i] as TableRowNode;
			const cells = row?.content ?? [];
			const cellContents: string[] = [];

			for (const cell of cells) {
				const isHeader = cell.type === 'tableHeader';
				if (isHeader && headerRowIndex === -1) {
					headerRowIndex = i;
				}
				const cellContent = this.convertTableCell(cell);
				cellContents.push(cellContent);
			}
			tableRows.push(cellContents);
		}

		if (tableRows.length === 0) return '';

		// Build markdown table
		const lines: string[] = [];
		
		// First row (header or first data row)
		const firstRow = tableRows[0] ?? [];
		lines.push('| ' + firstRow.join(' | ') + ' |');
		
		// Separator row
		lines.push('| ' + firstRow.map(() => '---').join(' | ') + ' |');
		
		// Remaining rows
		for (let i = 1; i < tableRows.length; i++) {
			const row = tableRows[i] ?? [];
			lines.push('| ' + row.join(' | ') + ' |');
		}

		return lines.join('\n') + '\n\n';
	}

	private convertTableCell(cell: TableCellNode | TableHeaderNode): string {
		const content = cell.content
			? this.convertNodes(cell.content, { inTableCell: true })
			: '';
		// Remove newlines and extra spaces for table cells
		return content.replace(/\n/g, ' ').trim();
	}

	private convertPanel(node: PanelNode): string {
		const panelType = node.attrs?.panelType ?? 'info';
		const content = node.content ? this.convertNodes(node.content) : '';
		
		// Use Obsidian callout syntax
		const calloutType = this.mapPanelTypeToCallout(panelType);
		const lines = content.trim().split('\n');
		const calloutContent = lines.map(line => `> ${line}`).join('\n');
		
		return `> [!${calloutType}]\n${calloutContent}\n\n`;
	}

	private mapPanelTypeToCallout(panelType: string): string {
		switch (panelType) {
			case 'info':
				return 'info';
			case 'note':
				return 'note';
			case 'warning':
				return 'warning';
			case 'success':
				return 'success';
			case 'error':
				return 'danger';
			default:
				return 'note';
		}
	}

	private convertExpand(node: ExpandNode): string {
		const title = node.attrs?.title ?? 'Details';
		const content = node.content ? this.convertNodes(node.content) : '';
		
		// Use Obsidian callout with collapse syntax
		const lines = content.trim().split('\n');
		const calloutContent = lines.map(line => `> ${line}`).join('\n');
		
		return `> [!info]- ${title}\n${calloutContent}\n\n`;
	}

	private convertMediaSingle(node: MediaSingleNode): string {
		const mediaNodes = node.content ?? [];
		const results: string[] = [];

		for (const media of mediaNodes) {
			if (media.type === 'media') {
				results.push(this.convertMedia(media));
			}
		}

		return results.join('\n') + '\n\n';
	}

	private convertMedia(node: MediaNode): string {
		const url = this.options.mediaUrlResolver(node);
		const alt = node.attrs?.alt ?? 'image';
		
		if (node.attrs?.type === 'file' || node.attrs?.type === 'external') {
			// Image or file link
			return `![${alt}](${url})`;
		}
		
		// Link type
		return `[${alt}](${url})`;
	}

	private defaultMediaUrlResolver(node: MediaNode): string {
		if (node.attrs?.url) {
			return node.attrs.url;
		}
		// Placeholder for Confluence attachments that need URL resolution
		return `attachment://${node.attrs?.id ?? 'unknown'}`;
	}

	private convertTaskList(node: TaskListNode, context: ConversionContext): string {
		const items = node.content ?? [];
		const result = items
			.map(item => this.convertTaskItem(item, context))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}

	private convertTaskItem(node: TaskItemNode, context: ConversionContext): string {
		const indent = '  '.repeat(context.listDepth ?? 0);
		const checked = node.attrs?.state === 'DONE' ? 'x' : ' ';
		const content = node.content
			? this.convertNodes(node.content, { ...context, inListItem: true })
			: '';
		return `${indent}- [${checked}] ${content.trim()}\n`;
	}

	private convertDecisionList(node: DecisionListNode, context: ConversionContext): string {
		const items = node.content ?? [];
		const result = items
			.map(item => this.convertDecisionItem(item, context))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}

	private convertDecisionItem(node: DecisionItemNode, context: ConversionContext): string {
		const indent = '  '.repeat(context.listDepth ?? 0);
		const content = node.content
			? this.convertNodes(node.content, { ...context, inListItem: true })
			: '';
		// Decisions are rendered as emphasized list items
		return `${indent}- **DECISION:** ${content.trim()}\n`;
	}

	private convertLayoutSection(node: ADFNode): string {
		// Layout sections are converted to sequential content
		// Obsidian doesn't have native multi-column support
		const content = node.content
			? node.content.map(col => {
					const colContent = col.content ? this.convertNodes(col.content) : '';
					return colContent;
				}).join('\n---\n\n')
			: '';
		
		if (this.options.includeUnsupportedComments) {
			return `<!-- Layout section (columns not supported) -->\n${content}`;
		}
		return content;
	}

	// ==================== Inline Node Converters ====================

	private convertText(node: TextNode): string {
		let text = node.text ?? '';
		
		if (node.marks && node.marks.length > 0) {
			text = this.applyMarks(text, node.marks);
		}
		
		return text;
	}

	private applyMarks(text: string, marks: ADFMark[]): string {
		let result = text;

		for (const mark of marks) {
			result = this.applyMark(result, mark);
		}

		return result;
	}

	private applyMark(text: string, mark: ADFMark): string {
		switch (mark.type) {
			case 'strong':
				return `**${text}**`;
			case 'em':
				return `*${text}*`;
			case 'code':
				return `\`${text}\``;
			case 'strike':
				return `~~${text}~~`;
			case 'underline':
				// Obsidian doesn't have native underline, use HTML
				return `<u>${text}</u>`;
			case 'link': {
				const href = (mark.attrs as { href?: string })?.href ?? '';
				return `[${text}](${href})`;
			}
			case 'subsup': {
				const subSupType = (mark.attrs as { type?: string })?.type;
				if (subSupType === 'sub') {
					return `<sub>${text}</sub>`;
				} else if (subSupType === 'sup') {
					return `<sup>${text}</sup>`;
				}
				return text;
			}
			case 'textColor': {
				// Use HTML span for text color (Obsidian renders HTML)
				const textColor = (mark.attrs as { color?: string })?.color ?? '';
				return `<span style="color: ${textColor}">${text}</span>`;
			}
			default:
				// Unknown mark, return text as-is
				return text;
		}
	}

	private convertHardBreak(): string {
		return '  \n'; // Two spaces followed by newline for Markdown line break
	}

	private convertMention(node: MentionNode): string {
		const displayText = this.options.mentionResolver(node);
		return `@${displayText}`;
	}

	private defaultMentionResolver(node: MentionNode): string {
		return node.attrs?.text ?? node.attrs?.id ?? 'unknown';
	}

	private convertEmoji(node: EmojiNode): string {
		// Use shortcode format which is widely supported
		const shortName = node.attrs?.shortName ?? '';
		// Remove colons if present and re-add them
		const cleanName = shortName.replace(/^:|:$/g, '');
		return `:${cleanName}:`;
	}

	private convertDate(node: DateNode): string {
		const timestamp = node.attrs?.timestamp;
		if (!timestamp) return '';
		
		try {
			const date = new Date(Number(timestamp));
			const isoString = date.toISOString();
			const datePart = isoString.split('T')[0];
			return datePart ?? '';
		} catch {
			return timestamp;
		}
	}

	private convertStatus(node: StatusNode): string {
		const text = node.attrs?.text ?? '';
		
		// Use badge-style formatting
		return `**[${text.toUpperCase()}]**`;
	}

	private convertInlineCard(node: InlineCardNode): string {
		const url = node.attrs?.url ?? '';
		if (url) {
			return `[${url}](${url})`;
		}
		return '';
	}

	// ==================== Extension/Macro Converters (Stubs) ====================

	private convertExtension(node: ADFNode): string {
		const attrs = node.attrs as { extensionKey?: string; extensionType?: string } | undefined;
		const extensionKey = attrs?.extensionKey ?? 'unknown';
		const extensionType = attrs?.extensionType ?? 'unknown';
		
		// Process bodied extension content if present
		const content = node.content ? this.convertNodes(node.content) : '';
		
		if (this.options.includeUnsupportedComments) {
			const comment = `<!-- Unsupported extension: ${extensionType}/${extensionKey} -->`;
			return content ? `${comment}\n${content}\n\n` : `${comment}\n\n`;
		}
		
		return content ? content + '\n\n' : '';
	}

	// ==================== Unsupported Node Handler ====================

	private convertUnsupported(node: ADFNode): string {
		if (this.options.includeUnsupportedComments) {
			return `<!-- Unsupported ADF node: ${node.type} -->\n\n`;
		}
		return '';
	}
}

/**
 * Context object passed during conversion to track state.
 */
interface ConversionContext {
	inListItem?: boolean;
	inTableCell?: boolean;
	listDepth?: number;
}

/**
 * Convenience function to convert ADF to Markdown.
 * @param adf - The ADF document to convert
 * @param options - Optional conversion options
 * @returns The converted Markdown string
 */
export function convertADFToMarkdown(adf: ADFDocument, options?: ADFToMarkdownOptions): string {
	const converter = new ADFToMarkdownConverter(options);
	return converter.convert(adf);
}
