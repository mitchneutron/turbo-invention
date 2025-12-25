/**
 * Media Node Converters
 */

import type { ADFNode, MediaNode, MediaSingleNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class MediaSingleConverter implements NodeConverter {
	readonly nodeTypes = ['mediaSingle', 'mediaGroup'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const mediaSingleNode = node as MediaSingleNode;
		const mediaNodes = mediaSingleNode.content ?? [];
		const results: string[] = [];

		for (const media of mediaNodes) {
			if (media.type === 'media') {
				results.push(this.convertMedia(media, registry));
			}
		}

		return results.join('\n') + '\n\n';
	}

	private convertMedia(node: MediaNode, registry: ConverterRegistry): string {
		const options = registry.getOptions();
		const url = options.mediaUrlResolver(node);
		const alt = node.attrs?.alt ?? 'image';
		
		if (node.attrs?.type === 'file' || node.attrs?.type === 'external') {
			// Image or file link
			return `![${alt}](${url})`;
		}
		
		// Link type
		return `[${alt}](${url})`;
	}
}
