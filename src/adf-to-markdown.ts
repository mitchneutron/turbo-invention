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
	MediaNode,
	MentionNode,
} from './adf-types';

import type { 
	ADFToMarkdownOptions,
	ConversionContext, 
	ConverterRegistry, 
	NodeConverter 
} from './converters';

import {
	// Block converters
	ParagraphConverter,
	HeadingConverter,
	BlockquoteConverter,
	CodeBlockConverter,
	BulletListConverter,
	OrderedListConverter,
	RuleConverter,
	TableConverter,
	PanelConverter,
	ExpandConverter,
	MediaSingleConverter,
	TaskListConverter,
	DecisionListConverter,
	LayoutSectionConverter,
	// Inline converters
	TextConverter,
	HardBreakConverter,
	MentionConverter,
	EmojiConverter,
	DateConverter,
	StatusConverter,
	InlineCardConverter,
	// Extension/stub converters
	ExtensionConverter,
	UnsupportedConverter,
} from './converters';

// Re-export types for external use
export type { ADFToMarkdownOptions, ConversionContext } from './converters';

/**
 * Converts Atlassian Document Format (ADF) to Obsidian-compatible Markdown.
 */
export class ADFToMarkdownConverter implements ConverterRegistry {
	private options: Required<ADFToMarkdownOptions>;
	private converterMap: Map<string, NodeConverter>;
	private unsupportedConverter: UnsupportedConverter;

	constructor(options: ADFToMarkdownOptions = {}) {
		this.options = {
			includeUnsupportedComments: options.includeUnsupportedComments ?? true,
			mediaUrlResolver: options.mediaUrlResolver ?? this.defaultMediaUrlResolver.bind(this),
			mentionResolver: options.mentionResolver ?? this.defaultMentionResolver.bind(this),
		};

		this.converterMap = new Map();
		this.unsupportedConverter = new UnsupportedConverter();
		this.registerConverters();
	}

	/**
	 * Register all available converters.
	 */
	private registerConverters(): void {
		const converters: NodeConverter[] = [
			// Block converters
			new ParagraphConverter(),
			new HeadingConverter(),
			new BlockquoteConverter(),
			new CodeBlockConverter(),
			new BulletListConverter(),
			new OrderedListConverter(),
			new RuleConverter(),
			new TableConverter(),
			new PanelConverter(),
			new ExpandConverter(),
			new MediaSingleConverter(),
			new TaskListConverter(),
			new DecisionListConverter(),
			new LayoutSectionConverter(),
			// Inline converters
			new TextConverter(),
			new HardBreakConverter(),
			new MentionConverter(),
			new EmojiConverter(),
			new DateConverter(),
			new StatusConverter(),
			new InlineCardConverter(),
			// Extension converter
			new ExtensionConverter(),
		];

		for (const converter of converters) {
			for (const nodeType of converter.nodeTypes) {
				this.converterMap.set(nodeType, converter);
			}
		}
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
	convertNodes(nodes: ADFNode[], context: ConversionContext = {}): string {
		return nodes.map(node => this.convertNode(node, context)).join('');
	}

	/**
	 * Convert a single ADF node to Markdown.
	 */
	convertNode(node: ADFNode, context: ConversionContext = {}): string {
		const converter = this.converterMap.get(node.type) ?? this.unsupportedConverter;
		return converter.convert(node, context, this);
	}

	/**
	 * Get the conversion options.
	 */
	getOptions(): Required<ADFToMarkdownOptions> {
		return this.options;
	}

	/**
	 * Apply marks to text content.
	 */
	applyMarks(text: string, marks: ADFMark[]): string {
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

	private defaultMediaUrlResolver(node: MediaNode): string {
		if (node.attrs?.url) {
			return node.attrs.url;
		}
		// Placeholder for Confluence attachments that need URL resolution
		return `attachment://${node.attrs?.id ?? 'unknown'}`;
	}

	private defaultMentionResolver(node: MentionNode): string {
		return node.attrs?.text ?? node.attrs?.id ?? 'unknown';
	}
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
