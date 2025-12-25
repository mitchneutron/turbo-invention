/**
 * Unsupported Node Converter (Fallback for unknown node types)
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class UnsupportedConverter implements NodeConverter {
	// This is a catch-all converter, so we don't specify node types
	readonly nodeTypes: string[] = [];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const options = registry.getOptions();
		if (options.includeUnsupportedComments) {
			return `<!-- Unsupported ADF node: ${node.type} -->\n\n`;
		}
		return '';
	}
}
