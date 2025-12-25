/**
 * Date Node Converter
 */

import type { ADFNode, DateNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class DateConverter implements NodeConverter {
	readonly nodeTypes = ['date'];

	convert(node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		const dateNode = node as DateNode;
		const timestamp = dateNode.attrs?.timestamp;
		if (!timestamp) return '';
		
		try {
			const date = new Date(Number(timestamp));
			const isoString = date.toISOString();
			const datePart = isoString.split('T')[0];
			return datePart ?? '';
		} catch {
			return timestamp;
		}
	}
}
