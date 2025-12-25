/**
 * Panel Node Converter
 */

import type { ADFNode, PanelNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class PanelConverter implements NodeConverter {
	readonly nodeTypes = ['panel'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const panelNode = node as PanelNode;
		const panelType = panelNode.attrs?.panelType ?? 'info';
		const content = panelNode.content ? registry.convertNodes(panelNode.content) : '';
		
		// Use Obsidian callout syntax
		const calloutType = this.mapPanelTypeToCallout(panelType);
		const lines = content.trim().split('\n');
		const calloutContent = lines.map(line => `> ${line}`).join('\n');
		
		return `> [!${calloutType}]\n${calloutContent}\n\n`;
	}

	private mapPanelTypeToCallout(panelType: string): string {
		switch (panelType) {
			case 'info':
				return 'info';
			case 'note':
				return 'note';
			case 'warning':
				return 'warning';
			case 'success':
				return 'success';
			case 'error':
				return 'danger';
			default:
				return 'note';
		}
	}
}
