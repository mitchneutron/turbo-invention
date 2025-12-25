/**
 * List Node Converters (Bullet, Ordered, List Item)
 */

import type { ADFNode, BulletListNode, ListItemNode, OrderedListNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class BulletListConverter implements NodeConverter {
	readonly nodeTypes = ['bulletList'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const bulletListNode = node as BulletListNode;
		const items = bulletListNode.content ?? [];
		const listItemConverter = new ListItemConverter();
		const result = items
			.map(item => listItemConverter.convertWithPrefix(item, '-', context, registry))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}
}

export class OrderedListConverter implements NodeConverter {
	readonly nodeTypes = ['orderedList'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const orderedListNode = node as OrderedListNode;
		const items = orderedListNode.content ?? [];
		const startOrder = orderedListNode.attrs?.order ?? 1;
		const listItemConverter = new ListItemConverter();
		const result = items
			.map((item, index) => listItemConverter.convertWithPrefix(item, `${startOrder + index}.`, context, registry))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}
}

export class ListItemConverter implements NodeConverter {
	readonly nodeTypes = ['listItem'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		// Default prefix when called directly
		return this.convertWithPrefix(node as ListItemNode, '-', context, registry);
	}

	convertWithPrefix(node: ListItemNode, prefix: string, context: ConversionContext, registry: ConverterRegistry): string {
		const indent = '  '.repeat(context.listDepth ?? 0);
		const newContext: ConversionContext = {
			...context,
			inListItem: true,
			listDepth: (context.listDepth ?? 0) + 1,
		};

		const contentParts: string[] = [];
		let firstParagraph = true;

		for (const child of node.content ?? []) {
			if (child.type === 'paragraph') {
				const paragraphContent = child.content ? registry.convertNodes(child.content, newContext) : '';
				if (firstParagraph) {
					contentParts.push(`${indent}${prefix} ${paragraphContent}\n`);
					firstParagraph = false;
				} else {
					contentParts.push(`${indent}  ${paragraphContent}\n`);
				}
			} else if (child.type === 'bulletList' || child.type === 'orderedList') {
				contentParts.push(registry.convertNode(child, newContext));
			} else {
				const converted = registry.convertNode(child, newContext);
				if (firstParagraph) {
					contentParts.push(`${indent}${prefix} ${converted}\n`);
					firstParagraph = false;
				} else {
					contentParts.push(converted);
				}
			}
		}

		return contentParts.join('');
	}
}
