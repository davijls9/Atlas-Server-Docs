// Documentation Module Type Definitions

export interface ModuleMetrics {
    name: string;
    path: string;
    loc: number;              // Lines of code
    complexity: number;       // Cyclomatic complexity (1-10)
    coverage: number;         // Test coverage % (0-100)
    errors: ModuleError[];
    warnings: ModuleWarning[];
    dependencies: string[];
    health: 'excellent' | 'good' | 'fair' | 'poor';
    lastModified: string;
}

export interface ModuleError {
    id: string;
    type: 'typescript' | 'runtime' | 'lint' | 'logic';
    severity: 'error' | 'warning' | 'info';
    message: string;
    file: string;
    line: number;
    column: number;
    suggestion?: string;
    fixable: boolean;
}

export interface ModuleWarning {
    id: string;
    message: string;
    file: string;
    line: number;
    severity: 'low' | 'medium' | 'high';
}

export interface ErrorFlowNode {
    id: string;
    label: string;
    type: 'entry' | 'decision' | 'error' | 'success' | 'fix';
    errors?: ModuleError[];
}

export interface ErrorFlowEdge {
    from: string;
    to: string;
    label?: string;
    condition?: string;
}

export interface ErrorDiagramType {
    nodes: any[];
    edges: any[];
    mermaidCode: string;
}


export interface DocumentationPermissions {
    view_documentation: boolean;
    view_error_analysis: boolean;
    view_module_metrics: boolean;
    edit_documentation: boolean;
}

export interface APIEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    parameters?: APIParameter[];
    returns: string;
    example?: string;
}

export interface APIParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
}

export interface ComponentDoc {
    name: string;
    path: string;
    description: string;
    props: ComponentProp[];
    examples: string[];
}

export interface ComponentProp {
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
}
export interface DocPage {
    id: string;
    title: string;
    content: string; // Markdown
    lastModified: string;
    tags: string[];
    relatedNodeIds?: string[]; // IDs of correlated infrastructure nodes
    relatedPageIds?: string[]; // IDs of application pages (tabs)
}
