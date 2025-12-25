/**
 * Extension Node Converter (Stub for unsupported macros/extensions)
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class ExtensionConverter implements NodeConverter {
	readonly nodeTypes = ['bodiedExtension', 'extension', 'inlineExtension'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const attrs = node.attrs as { extensionKey?: string; extensionType?: string } | undefined;
		const extensionKey = attrs?.extensionKey ?? 'unknown';
		const extensionType = attrs?.extensionType ?? 'unknown';
		
		// Process bodied extension content if present
		const content = node.content ? registry.convertNodes(node.content) : '';
		
		const options = registry.getOptions();
		if (options.includeUnsupportedComments) {
			const comment = `<!-- Unsupported extension: ${extensionType}/${extensionKey} -->`;
			return content ? `${comment}\n${content}\n\n` : `${comment}\n\n`;
		}
		
		return content ? content + '\n\n' : '';
	}
}
