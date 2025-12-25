/**
 * Inline Card Node Converter
 */

import type { ADFNode, InlineCardNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class InlineCardConverter implements NodeConverter {
	readonly nodeTypes = ['inlineCard'];

	convert(node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		const inlineCardNode = node as InlineCardNode;
		const url = inlineCardNode.attrs?.url ?? '';
		if (url) {
			return `[${url}](${url})`;
		}
		return '';
	}
}
