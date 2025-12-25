/**
 * Rule (Horizontal Rule) Node Converter
 */

import type { ADFNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class RuleConverter implements NodeConverter {
	readonly nodeTypes = ['rule'];

	convert(_node: ADFNode, _context: ConversionContext, _registry: ConverterRegistry): string {
		return '---\n\n';
	}
}
