/**
 * Blockquote Node Converter
 */

import type { ADFNode, BlockquoteNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class BlockquoteConverter implements NodeConverter {
	readonly nodeTypes = ['blockquote'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const blockquoteNode = node as BlockquoteNode;
		const content = blockquoteNode.content ? registry.convertNodes(blockquoteNode.content) : '';
		// Prefix each line with >
		const lines = content.trim().split('\n');
		const quoted = lines.map(line => `> ${line}`).join('\n');
		return quoted + '\n\n';
	}
}
