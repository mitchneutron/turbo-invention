/**
 * Heading Node Converter
 */

import type { ADFNode, HeadingNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class HeadingConverter implements NodeConverter {
	readonly nodeTypes = ['heading'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const headingNode = node as HeadingNode;
		const level = headingNode.attrs?.level ?? 1;
		const prefix = '#'.repeat(level);
		const content = headingNode.content ? registry.convertNodes(headingNode.content) : '';
		return `${prefix} ${content}\n\n`;
	}
}
