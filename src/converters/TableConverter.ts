/**
 * Table Node Converters
 */

import type { ADFNode, TableCellNode, TableHeaderNode, TableNode, TableRowNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class TableConverter implements NodeConverter {
	readonly nodeTypes = ['table'];

	convert(node: ADFNode, _context: ConversionContext, registry: ConverterRegistry): string {
		const tableNode = node as TableNode;
		const rows = tableNode.content ?? [];
		if (rows.length === 0) return '';

		const tableRows: string[][] = [];
		let headerRowIndex = -1;

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i] as TableRowNode;
			const cells = row?.content ?? [];
			const cellContents: string[] = [];

			for (const cell of cells) {
				const isHeader = cell.type === 'tableHeader';
				if (isHeader && headerRowIndex === -1) {
					headerRowIndex = i;
				}
				const cellContent = this.convertTableCell(cell, registry);
				cellContents.push(cellContent);
			}
			tableRows.push(cellContents);
		}

		if (tableRows.length === 0) return '';

		// Build markdown table
		const lines: string[] = [];
		
		// First row (header or first data row)
		const firstRow = tableRows[0] ?? [];
		lines.push('| ' + firstRow.join(' | ') + ' |');
		
		// Separator row
		lines.push('| ' + firstRow.map(() => '---').join(' | ') + ' |');
		
		// Remaining rows
		for (let i = 1; i < tableRows.length; i++) {
			const row = tableRows[i] ?? [];
			lines.push('| ' + row.join(' | ') + ' |');
		}

		return lines.join('\n') + '\n\n';
	}

	private convertTableCell(cell: TableCellNode | TableHeaderNode, registry: ConverterRegistry): string {
		const content = cell.content
			? registry.convertNodes(cell.content, { inTableCell: true })
			: '';
		// Remove newlines and extra spaces for table cells
		return content.replace(/\n/g, ' ').trim();
	}
}
