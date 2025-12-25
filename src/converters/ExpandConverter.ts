/**
 * Expand Node Converter
 */

import type { ADFNode, ExpandNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class ExpandConverter implements NodeConverter {
	readonly nodeTypes = ['expand', 'nestedExpand'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const expandNode = node as ExpandNode;
		const title = expandNode.attrs?.title ?? 'Details';
		const content = expandNode.content ? registry.convertNodes(expandNode.content) : '';
		
		// Use Obsidian callout with collapse syntax
		const lines = content.trim().split('\n');
		const calloutContent = lines.map(line => `> ${line}`).join('\n');
		
		return `> [!info]- ${title}\n${calloutContent}\n\n`;
	}
}
