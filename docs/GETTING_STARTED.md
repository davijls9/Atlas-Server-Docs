# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Projeto Documentacao"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Flow
- Lucide React (icons)
- And other dependencies

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## First Time Setup

### 1. Create Admin User

On first launch, the application will prompt you to create an admin user:

1. Navigate to the login page
2. Click "Create Admin Account"
3. Enter username and password
4. You'll be assigned to the `admin-group` automatically

### 2. Configure Permissions

As an admin, you can configure permissions for different user groups:

1. Go to **Profile** page
2. Click **"Manage Groups"**
3. Create custom groups or modify existing ones
4. Assign permissions to each group

### 3. Create Your First Workspace

1. Go to **Workspace** page
2. Click **"New Workspace"**
3. Enter workspace name and description
4. Start adding infrastructure nodes

## Basic Usage

### Creating a Blueprint Schema

1. Navigate to **Blueprint** page
2. Click **"Add Attribute"**
3. Define attribute properties:
   - ID (unique identifier)
   - Label (display name)
   - Type (TEXT, NUMBER, or BOOLEAN)
   - Default value
   - Applies to (node types)
4. Click **"Save"**

### Adding Infrastructure Nodes

1. Go to **Workspace** page
2. Click **"Add Node"**
3. Select node type (POP, Server, VM, etc.)
4. Fill in node details
5. Set attribute values
6. Click **"Create"**

### Running Security Audit

1. Navigate to **Security** page
2. Click **"CORRELATE ATTRIBUTES"**
3. Select BOOLEAN attributes to track
4. Click **"CORRELATE"**
5. View compliance matrix
6. Generate audit report

### Visualizing Infrastructure

1. Go to **Infra Map** page
2. View your infrastructure topology
3. Drag nodes to arrange layout
4. Click nodes to edit properties
5. Connect nodes with edges

## Development Workflow

### Project Structure

```
src/
├── modules/           # Feature modules
│   ├── security/     # Security audit
│   ├── blueprint/    # Schema management
│   └── common/       # Shared components
├── components/       # Legacy components
├── utils/            # Utilities
└── App.tsx           # Main app
```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes in the appropriate module

3. Test your changes:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "Add my feature"
   git push origin feature/my-feature
   ```

### Code Style

- Use TypeScript for all new code
- Follow the modular architecture
- Keep components under 200 lines
- Extract hooks for complex logic
- Write utility functions for calculations
- Add JSDoc comments for public APIs

## Common Tasks

### Adding a New Module

1. Create module directory:
   ```bash
   mkdir -p src/modules/mymodule/{components,hooks,utils,types}
   ```

2. Create type definitions in `types/mymodule.types.ts`

3. Build components in `components/`

4. Create hooks in `hooks/`

5. Add utilities in `utils/`

6. Document in `docs/modules/mymodule.md`

### Adding a New Component

1. Create component file:
   ```typescript
   // src/modules/mymodule/components/MyComponent.tsx
   import React from 'react';
   
   interface MyComponentProps {
       // Define props
   }
   
   export const MyComponent: React.FC<MyComponentProps> = (props) => {
       return <div>My Component</div>;
   };
   ```

2. Export from module:
   ```typescript
   // src/modules/mymodule/index.ts
   export { MyComponent } from './components/MyComponent';
   ```

3. Use in other components:
   ```typescript
   import { MyComponent } from '@/modules/mymodule';
   ```

### Adding a New Permission

1. Update permission types:
   ```typescript
   interface Permissions {
       my_new_permission: boolean;
   }
   ```

2. Add to default groups:
   ```typescript
   const adminGroup = {
       id: 'admin-group',
       permissions: {
           my_new_permission: true
       }
   };
   ```

3. Check permission in components:
   ```typescript
   const { canDoSomething } = usePermissions(currentUser);
   ```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Check your TypeScript configuration:

```bash
npx tsc --noEmit
```

### Build Failures

Clear Vite cache:

```bash
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

- Read the [Architecture Documentation](./ARCHITECTURE.md)
- Explore [Module Documentation](./modules/)
- Check the [API Reference](./API_REFERENCE.md)
- Review [Best Practices](./BEST_PRACTICES.md)

## Getting Help

- Check the documentation in `docs/`
- Review module-specific docs in `docs/modules/`
- Contact the development team

---

**Happy Coding!** 🚀
