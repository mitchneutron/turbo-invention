/**
 * Hard Break Node Converter
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class HardBreakConverter implements NodeConverter {
	readonly nodeTypes = ['hardBreak'];

	convert(_node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		return '  \n'; // Two spaces followed by newline for Markdown line break
	}
}
