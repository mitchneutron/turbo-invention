/**
 * Task List Node Converters
 */

import type { ADFNode, TaskItemNode, TaskListNode } from '../adf-types';
import type { ConversionContext, ConverterRegistry, NodeConverter } from './NodeConverter';

export class TaskListConverter implements NodeConverter {
	readonly nodeTypes = ['taskList'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const taskListNode = node as TaskListNode;
		const items = taskListNode.content ?? [];
		const taskItemConverter = new TaskItemConverter();
		const result = items
			.map(item => taskItemConverter.convert(item, context, registry))
			.join('');
		return result + (context.inListItem ? '' : '\n');
	}
}

export class TaskItemConverter implements NodeConverter {
	readonly nodeTypes = ['taskItem'];

	convert(node: ADFNode, context: ConversionContext, registry: ConverterRegistry): string {
		const taskItemNode = node as TaskItemNode;
		const indent = '  '.repeat(context.listDepth ?? 0);
		const checked = taskItemNode.attrs?.state === 'DONE' ? 'x' : ' ';
		const content = taskItemNode.content
			? registry.convertNodes(taskItemNode.content, { ...context, inListItem: true })
			: '';
		return `${indent}- [${checked}] ${content.trim()}\n`;
	}
}
