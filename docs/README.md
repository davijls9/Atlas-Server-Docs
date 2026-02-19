# Infrastructure Documentation System

## Overview

This is a comprehensive infrastructure documentation and management system built with React, TypeScript, and Vite. The system provides tools for managing infrastructure blueprints, visualizing network topology, tracking security compliance, and maintaining documentation.

## Features

- **Blueprint Editor** - Define and manage infrastructure schemas with custom attributes
- **Infrastructure Map** - Visual representation of network topology with React Flow
- **Security Audit** - Compliance tracking and security attribute correlation
- **Documentation** - Comprehensive project documentation with error analysis
- **Workspace Management** - Multi-workspace support with data isolation
- **Permission System** - Role-based access control
- **Logging** - System-wide event logging and monitoring

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Visualization**: React Flow
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Data Storage**: LocalStorage (client-side)

## Project Structure

```
src/
├── modules/                 # Modular feature organization
│   ├── security/           # Security audit module
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── blueprint/          # Blueprint editor module
│   ├── documentation/      # Documentation system module
│   └── common/             # Shared components and utilities
├── components/             # Legacy components (being refactored)
├── utils/                  # Global utilities
└── App.tsx                 # Main application

docs/                       # Project documentation
├── README.md              # This file
├── ARCHITECTURE.md        # System architecture
├── GETTING_STARTED.md     # Setup guide
├── API_REFERENCE.md       # API documentation
└── modules/               # Module-specific docs
    └── security.md        # Security module docs
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd Projeto\ Documentacao

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Key Modules

### Security Module

Provides comprehensive security audit and compliance tracking.

**Features:**
- Attribute correlation with blueprint schema
- Multi-strategy attribute matching
- Compliance scoring and risk assessment
- Manual override support
- Detailed audit reports

[Read more →](./modules/security.md)

### Blueprint Module

Schema definition and management for infrastructure components.

**Features:**
- Custom attribute definitions
- Node type management
- Schema import/export
- Field management

### Infrastructure Map

Visual network topology with interactive node management.

**Features:**
- React Flow-based visualization
- Drag-and-drop node placement
- Edge connections
- Property editing

### Documentation Module

*(In Development)*

Self-documenting system with error analysis and module metrics.

**Planned Features:**
- Module health monitoring
- Error flow diagrams
- API reference generation
- Architecture visualization

## Permission System

The application uses a role-based permission system stored in localStorage.

**Default Groups:**
- `admin-group` - Full access to all features
- `viewer-group` - Read-only access

**Permissions:**
- `manage_security_cols` - Manage security audit columns
- `view_documentation` - Access documentation
- `edit_documentation` - Edit documentation
- *(more permissions as needed)*

## Data Storage

Data is stored in browser localStorage:

- `antigravity_blueprint_data` - Blueprint schemas and nodes
- `antigravity_security_columns` - Security audit columns
- `antigravity_security_overrides` - Manual compliance overrides
- `antigravity_groups` - User groups and permissions
- `antigravity_logs` - System event logs

## Development

### Code Style

- Use TypeScript for type safety
- Follow modular architecture
- Keep components under 200 lines
- Extract hooks for complex logic
- Use utility functions for calculations

### Adding a New Module

1. Create module directory in `src/modules/`
2. Define TypeScript types in `types/`
3. Create utility functions in `utils/`
4. Build custom hooks in `hooks/`
5. Create UI components in `components/`
6. Write module documentation in `docs/modules/`

### Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update documentation
4. Submit a pull request

## License

*(Add license information)*

## Support

For issues or questions, please contact the development team.

---

**Version**: 2.2  
**Last Updated**: 2026-02-17  
**Maintained by**: Development Team
