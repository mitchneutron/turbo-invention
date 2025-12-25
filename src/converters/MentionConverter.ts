/**
 * Mention Node Converter
 */

import type { ADFNode, MentionNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class MentionConverter implements NodeConverter {
	readonly nodeTypes = ['mention'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const mentionNode = node as MentionNode;
		const options = registry.getOptions();
		const displayText = options.mentionResolver(mentionNode);
		return `@${displayText}`;
	}
}
