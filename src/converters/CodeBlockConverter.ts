/**
 * Code Block Node Converter
 */

import type { ADFNode, CodeBlockNode, TextNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class CodeBlockConverter implements NodeConverter {
	readonly nodeTypes = ['codeBlock'];

	convert(node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		const codeBlockNode = node as CodeBlockNode;
		const language = codeBlockNode.attrs?.language ?? '';
		const content = codeBlockNode.content
			? codeBlockNode.content.map(n => (n as TextNode).text ?? '').join('')
			: '';
		return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
	}
}
