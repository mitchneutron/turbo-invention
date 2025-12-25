/**
 * Decision List Node Converters
 */

import type { ADFNode, DecisionItemNode, DecisionListNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class DecisionListConverter implements NodeConverter {
	readonly nodeTypes = ['decisionList'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const decisionListNode = node as DecisionListNode;
		const items = decisionListNode.content ?? [];
		const decisionItemConverter = new DecisionItemConverter();
		const result = items
			.map(item => decisionItemConverter.convert(item, context, registry))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}
}

export class DecisionItemConverter implements NodeConverter {
	readonly nodeTypes = ['decisionItem'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const decisionItemNode = node as DecisionItemNode;
		const indent = '  '.repeat(context.listDepth ?? 0);
		const content = decisionItemNode.content
			? registry.convertNodes(decisionItemNode.content, { ...context, inListItem: true })
			: '';
		// Decisions are rendered as emphasized list items
		return `${indent}- **DECISION:** ${content.trim()}\n`;
	}
}
