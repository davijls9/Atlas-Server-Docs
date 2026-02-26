export const CLEAN_BLUEPRINT_TEMPLATE = `{
  "id": "new-manifest-v1",
  "name": "Untitled Infrastructure",
  "version": "1.0.0",
  "metadata": {
    "organization": "Atlas Sovereign",
    "clearance": "TIER-1",
    "ssd_compliance": "PENDING"
  },
  "nodes": [],
  "connections": []
}`;

export const INITIAL_DOCS = [
    {
        id: 'welcome',
        title: 'Infrastructure Encyclopedia Welcome',
        content: '# Welcome to the Global Infrastructure Encyclopedia\\n\\nThis is your central source of truth for all documentation related to the Atlas Server system.\\n\\n## Getting Started\\n- Use the sidebar to navigate between documentation pages.\\n- Click **Create New Page** to add a new document to the encyclopedia.\\n- Use the **Edit Protocol** button to modify existing content.',
        lastModified: new Date().toISOString(),
        tags: ['Help', 'Overview', 'Welcome'],
        relatedNodeIds: [],
        relatedPageIds: ['editor', 'map', 'data', 'security', 'workspace', 'docs', 'logs']
    }
];
