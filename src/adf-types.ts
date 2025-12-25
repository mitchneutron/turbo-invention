/**
 * Atlassian Document Format (ADF) TypeScript definitions.
 * Based on https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

// Mark types
export interface ADFMark {
	type: string;
	attrs?: Record<string, unknown>;
}

export interface StrongMark extends ADFMark {
	type: 'strong';
}

export interface EmMark extends ADFMark {
	type: 'em';
}

export interface CodeMark extends ADFMark {
	type: 'code';
}

export interface StrikeMark extends ADFMark {
	type: 'strike';
}

export interface UnderlineMark extends ADFMark {
	type: 'underline';
}

export interface LinkMark extends ADFMark {
	type: 'link';
	attrs: {
		href: string;
		title?: string;
	};
}

export interface SubSupMark extends ADFMark {
	type: 'subsup';
	attrs: {
		type: 'sub' | 'sup';
	};
}

export interface TextColorMark extends ADFMark {
	type: 'textColor';
	attrs: {
		color: string;
	};
}

// Base node interface
export interface ADFNode {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ADFNode[];
	marks?: ADFMark[];
	text?: string;
}

// Top-level document
export interface ADFDocument extends ADFNode {
	type: 'doc';
	version: 1;
	content: ADFNode[];
}

// Text node
export interface TextNode extends ADFNode {
	type: 'text';
	text: string;
	marks?: ADFMark[];
}

// Paragraph
export interface ParagraphNode extends ADFNode {
	type: 'paragraph';
	content?: ADFNode[];
}

// Heading
export interface HeadingNode extends ADFNode {
	type: 'heading';
	attrs: {
		level: 1 | 2 | 3 | 4 | 5 | 6;
	};
	content?: ADFNode[];
}

// Blockquote
export interface BlockquoteNode extends ADFNode {
	type: 'blockquote';
	content: ADFNode[];
}

// Code block
export interface CodeBlockNode extends ADFNode {
	type: 'codeBlock';
	attrs?: {
		language?: string;
	};
	content?: ADFNode[];
}

// Bullet list
export interface BulletListNode extends ADFNode {
	type: 'bulletList';
	content: ListItemNode[];
}

// Ordered list
export interface OrderedListNode extends ADFNode {
	type: 'orderedList';
	attrs?: {
		order?: number;
	};
	content: ListItemNode[];
}

// List item
export interface ListItemNode extends ADFNode {
	type: 'listItem';
	content: ADFNode[];
}

// Horizontal rule
export interface RuleNode extends ADFNode {
	type: 'rule';
}

// Hard break
export interface HardBreakNode extends ADFNode {
	type: 'hardBreak';
}

// Panel
export interface PanelNode extends ADFNode {
	type: 'panel';
	attrs: {
		panelType: 'info' | 'note' | 'warning' | 'success' | 'error';
	};
	content: ADFNode[];
}

// Table nodes
export interface TableNode extends ADFNode {
	type: 'table';
	attrs?: {
		isNumberColumnEnabled?: boolean;
		layout?: 'default' | 'wide' | 'full-width';
	};
	content: TableRowNode[];
}

export interface TableRowNode extends ADFNode {
	type: 'tableRow';
	content: (TableHeaderNode | TableCellNode)[];
}

export interface TableHeaderNode extends ADFNode {
	type: 'tableHeader';
	attrs?: {
		colspan?: number;
		rowspan?: number;
		colwidth?: number[];
		background?: string;
	};
	content: ADFNode[];
}

export interface TableCellNode extends ADFNode {
	type: 'tableCell';
	attrs?: {
		colspan?: number;
		rowspan?: number;
		colwidth?: number[];
		background?: string;
	};
	content: ADFNode[];
}

// Media nodes
export interface MediaSingleNode extends ADFNode {
	type: 'mediaSingle';
	attrs?: {
		layout?: 'wrap-left' | 'center' | 'wrap-right' | 'wide' | 'full-width' | 'align-start' | 'align-end';
		width?: number;
	};
	content: MediaNode[];
}

export interface MediaGroupNode extends ADFNode {
	type: 'mediaGroup';
	content: MediaNode[];
}

export interface MediaNode extends ADFNode {
	type: 'media';
	attrs: {
		id: string;
		type: 'file' | 'link' | 'external';
		collection?: string;
		width?: number;
		height?: number;
		alt?: string;
		url?: string;
	};
}

// Expand/collapse
export interface ExpandNode extends ADFNode {
	type: 'expand';
	attrs?: {
		title?: string;
	};
	content: ADFNode[];
}

export interface NestedExpandNode extends ADFNode {
	type: 'nestedExpand';
	attrs?: {
		title?: string;
	};
	content: ADFNode[];
}

// Inline nodes
export interface MentionNode extends ADFNode {
	type: 'mention';
	attrs: {
		id: string;
		text?: string;
		accessLevel?: string;
	};
}

export interface EmojiNode extends ADFNode {
	type: 'emoji';
	attrs: {
		shortName: string;
		id?: string;
		text?: string;
	};
}

export interface DateNode extends ADFNode {
	type: 'date';
	attrs: {
		timestamp: string;
	};
}

export interface StatusNode extends ADFNode {
	type: 'status';
	attrs: {
		text: string;
		color: 'neutral' | 'purple' | 'blue' | 'red' | 'yellow' | 'green';
	};
}

export interface InlineCardNode extends ADFNode {
	type: 'inlineCard';
	attrs: {
		url?: string;
		data?: Record<string, unknown>;
	};
}

export interface TaskListNode extends ADFNode {
	type: 'taskList';
	attrs: {
		localId: string;
	};
	content: TaskItemNode[];
}

export interface TaskItemNode extends ADFNode {
	type: 'taskItem';
	attrs: {
		localId: string;
		state: 'TODO' | 'DONE';
	};
	content: ADFNode[];
}

export interface DecisionListNode extends ADFNode {
	type: 'decisionList';
	attrs: {
		localId: string;
	};
	content: DecisionItemNode[];
}

export interface DecisionItemNode extends ADFNode {
	type: 'decisionItem';
	attrs: {
		localId: string;
		state: 'DECIDED';
	};
	content: ADFNode[];
}

// Layout
export interface LayoutSectionNode extends ADFNode {
	type: 'layoutSection';
	content: LayoutColumnNode[];
}

export interface LayoutColumnNode extends ADFNode {
	type: 'layoutColumn';
	attrs: {
		width: number;
	};
	content: ADFNode[];
}

// Placeholder for unsupported nodes
export interface PlaceholderNode extends ADFNode {
	type: 'placeholder';
	attrs: {
		text: string;
	};
}

// Bodied extension (macros, apps, etc.)
export interface BodiedExtensionNode extends ADFNode {
	type: 'bodiedExtension';
	attrs: {
		extensionType: string;
		extensionKey: string;
		parameters?: Record<string, unknown>;
		layout?: string;
	};
	content?: ADFNode[];
}

// Inline extension
export interface InlineExtensionNode extends ADFNode {
	type: 'inlineExtension';
	attrs: {
		extensionType: string;
		extensionKey: string;
		parameters?: Record<string, unknown>;
	};
}

// Extension (non-bodied)
export interface ExtensionNode extends ADFNode {
	type: 'extension';
	attrs: {
		extensionType: string;
		extensionKey: string;
		parameters?: Record<string, unknown>;
		layout?: string;
	};
}
