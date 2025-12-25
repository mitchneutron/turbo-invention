/**
 * Node Converter Interface
 * 
 * All ADF node converters must implement this interface.
 * The interface is designed as a superset that supports all conversion scenarios.
 */

import type { ADFMark, ADFNode, MediaNode, MentionNode } from '../adf-types';

/**
 * Context object passed during conversion to track state.
 */
export interface ConversionContext {
	/** Whether we're currently inside a list item */
	inListItem?: boolean;
	/** Whether we're currently inside a table cell */
	inTableCell?: boolean;
	/** Current nesting depth for lists */
	listDepth?: number;
}

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
 * The converter registry interface that individual converters can use
 * to recursively convert child nodes.
 */
export interface ConverterRegistry {
	/**
	 * Convert an array of ADF nodes to Markdown.
	 */
	convertNodes(nodes: ADFNode[], context?: ConversionContext): string;

	/**
	 * Convert a single ADF node to Markdown.
	 */
	convertNode(node: ADFNode, context?: ConversionContext): string;

	/**
	 * Get the conversion options.
	 */
	getOptions(): Required<ADFToMarkdownOptions>;

	/**
	 * Apply marks to text content.
	 */
	applyMarks(text: string, marks: ADFMark[]): string;
}

/**
 * Interface for all node converters.
 * Implementations should handle converting a specific ADF node type to Markdown.
 */
export interface NodeConverter {
	/**
	 * The ADF node type(s) this converter handles.
	 */
	readonly nodeTypes: string[];

	/**
	 * Convert the node to Markdown.
	 * @param node - The ADF node to convert
	 * @param context - The current conversion context
	 * @param registry - Access to the converter registry for recursive conversion
	 * @returns The Markdown string representation
	 */
	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string;
}
