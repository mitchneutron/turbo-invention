/**
 * Emoji Node Converter
 */

import type { ADFNode, EmojiNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class EmojiConverter implements NodeConverter {
	readonly nodeTypes = ['emoji'];

	convert(node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		const emojiNode = node as EmojiNode;
		// Use shortcode format which is widely supported
		const shortName = emojiNode.attrs?.shortName ?? '';
		// Remove colons if present and re-add them
		const cleanName = shortName.replace(/^:|:$/g, '');
		return `:${cleanName}:`;
	}
}
