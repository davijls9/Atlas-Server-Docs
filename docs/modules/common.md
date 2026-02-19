# Common Module Documentation

## Overview

The Common module provides shared components, hooks, and utilities used across all other modules in the application.

## Components

### Button

Reusable button component with consistent styling.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger'`
- `size?: 'sm' | 'md' | 'lg'`
- `disabled?: boolean`
- `onClick?: () => void`
- `children: ReactNode`

### Modal

Reusable modal/dialog component.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `title?: string`
- `children: ReactNode`

### Tooltip

Tooltip component for displaying additional information on hover.

**Props:**
- `content: string | ReactNode`
- `children: ReactNode`
- `position?: 'top' | 'bottom' | 'left' | 'right'`

## Hooks

### usePermissions

Hook for checking user permissions.

```typescript
const { canManage, canView, canEdit } = usePermissions(currentUser);
```

### useToast

Hook for displaying toast notifications.

```typescript
const { showToast } = useToast();
showToast('Success!', 'success');
```

### useLogger

Hook for logging events.

```typescript
const { logEvent } = useLogger();
logEvent('INFO', 'User logged in', 'AUTH');
```

## Utilities

### permissions.ts

Functions for permission checking and management.

### logger.ts

Logging utilities for system events.

### validators.ts

Common validation functions.

## Usage

```typescript
import { Button, Modal } from '@/modules/common/components';
import { usePermissions, useToast } from '@/modules/common/hooks';
import { validateEmail } from '@/modules/common/utils/validators';

const MyComponent = () => {
    const { canManage } = usePermissions(currentUser);
    const { showToast } = useToast();
    
    return (
        <Button 
            variant="primary"
            onClick={() => showToast('Clicked!', 'info')}
            disabled={!canManage}
        >
            Click Me
        </Button>
    );
};
```
