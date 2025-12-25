/**
 * Text Node Converter
 */

import type { ADFNode, TextNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class TextConverter implements NodeConverter {
	readonly nodeTypes = ['text'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const textNode = node as TextNode;
		let text = textNode.text ?? '';
		
		if (textNode.marks && textNode.marks.length > 0) {
			text = registry.applyMarks(text, textNode.marks);
		}
		
		return text;
	}
}
