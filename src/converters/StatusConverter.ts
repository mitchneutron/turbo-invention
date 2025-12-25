/**
 * Status Node Converter
 */

import type { ADFNode, StatusNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class StatusConverter implements NodeConverter {
	readonly nodeTypes = ['status'];

	convert(node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		const statusNode = node as StatusNode;
		const text = statusNode.attrs?.text ?? '';
		
		// Use badge-style formatting
		return `**[${text.toUpperCase()}]**`;
	}
}
