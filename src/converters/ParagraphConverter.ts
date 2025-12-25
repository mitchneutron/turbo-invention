/**
 * Paragraph Node Converter
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class ParagraphConverter implements NodeConverter {
	readonly nodeTypes = ['paragraph'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const content = node.content ? registry.convertNodes(node.content, context) : '';
		// Don't add extra newlines if we're inside a list item or table cell
		if (context.inListItem || context.inTableCell) {
			return content;
		}
		return content + '\n\n';
	}
}
