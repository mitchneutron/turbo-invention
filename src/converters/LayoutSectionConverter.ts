/**
 * Layout Section Node Converter
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class LayoutSectionConverter implements NodeConverter {
	readonly nodeTypes = ['layoutSection'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		// Layout sections are converted to sequential content
		// Obsidian doesn't have native multi-column support
		const content = node.content
			? node.content.map(col => {
					const colContent = col.content ? registry.convertNodes(col.content) : '';
					return colContent;
				}).join('\n---\n\n')
			: '';
		
		const options = registry.getOptions();
		if (options.includeUnsupportedComments) {
			return `<!-- Layout section (columns not supported) -->\n${content}`;
		}
		return content;
	}
}
