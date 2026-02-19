# Security Module Documentation

## Overview

The Security module provides comprehensive security audit and compliance tracking functionality. It allows users to correlate blueprint attributes with security requirements and track compliance across the infrastructure.

## Architecture

```
security/
├── components/          # React components
│   ├── ComplianceCell.tsx
│   ├── SecurityStats.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   └── useComplianceCalculation.ts
├── utils/              # Utility functions
│   ├── complianceCalculator.ts
│   ├── attributeMatcher.ts
│   └── reportBuilder.ts
└── types/              # TypeScript type definitions
    └── security.types.ts
```

## Components

### ComplianceCell

Displays compliance status for a single attribute on a node.

**Props:**
- `node: SecurityNode` - The node to display compliance for
- `column: AuditColumn` - The audit column/attribute
- `onToggle: (nodeId, columnKey) => void` - Callback for manual override
- `canManage: boolean` - Whether user can toggle compliance
- `overrides: SecurityOverrides` - Manual compliance overrides

**Features:**
- Shows COMPLIANT/MISSING badge
- Detailed tooltip with value, match strategy, and native status
- Visual indicator for manual overrides
- Permission-based interaction

### SecurityStats

Displays overview statistics for the security audit.

**Props:**
- `stats: SecurityStats` - Statistics object

**Displays:**
- Total monitored assets
- Protected nodes (>90% compliance)
- Critical gaps (<40% compliance)
- Average compliance score

## Hooks

### useComplianceCalculation

Calculates compliance data for a node based on audit columns.

**Parameters:**
- `item: any` - The node to calculate compliance for
- `auditCols: AuditColumn[]` - Audit columns to check
- `overrides: SecurityOverrides` - Manual overrides

**Returns:**
```typescript
{
    compliance: Record<string, ComplianceData>,
    score: number,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}
```

## Utilities

### attributeMatcher

Matches attribute values using multiple fallback strategies:

1. **attrById** - Direct match by attribute ID
2. **attrByLabel** - Match by label (case-insensitive)
3. **directById** - Direct property access by column ID
4. **directByKey** - Direct property access by column key
5. **fuzzy** - Fuzzy match on normalized property names

### complianceCalculator

Provides utility functions for:
- Calculating node compliance scores
- Calculating overall security statistics
- Checking if values are compliant
- Normalizing strings for matching

### reportBuilder

Builds comprehensive audit reports with:
- Metadata (timestamp, user, correlated attributes)
- Summary statistics
- Attribute breakdown
- Detailed asset information
- Override tracking

## Type Definitions

### SecurityNode

```typescript
interface SecurityNode {
    id: string;
    name: string;
    type: NodeType;
    ip?: string;
    attributes?: NodeAttribute[];
    compliance?: Record<string, ComplianceData>;
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    processedChildren?: SecurityNode[];
}
```

### ComplianceData

```typescript
interface ComplianceData {
    native: boolean;        // Natively compliant
    current: boolean;       // Current compliance (including overrides)
    value?: any;            // Actual attribute value
    matchStrategy?: MatchStrategy;  // How the value was matched
}
```

## Usage Example

```typescript
import { ComplianceCell } from '@/modules/security/components/ComplianceCell';
import { useComplianceCalculation } from '@/modules/security/hooks/useComplianceCalculation';
import { buildAuditReport } from '@/modules/security/utils/reportBuilder';

// In a component
const { compliance, score, riskLevel } = useComplianceCalculation(
    node,
    auditColumns,
    overrides
);

// Render compliance cell
<ComplianceCell
    node={node}
    column={column}
    onToggle={handleToggle}
    canManage={canManageCols}
    overrides={overrides}
/>

// Generate report
const report = buildAuditReport(
    auditNodes,
    auditColumns,
    overrides,
    stats,
    currentUser
);
downloadReport(report);
```

## Best Practices

1. **Always use TypeScript types** - Import from `security.types.ts`
2. **Use hooks for state logic** - Keep components focused on UI
3. **Leverage utility functions** - Don't duplicate calculation logic
4. **Handle permissions** - Check `canManage` before allowing interactions
5. **Provide feedback** - Use tooltips and visual indicators

## Testing

```typescript
// Test compliance calculation
const result = useComplianceCalculation(mockNode, mockColumns, {});
expect(result.score).toBe(100);
expect(result.riskLevel).toBe('LOW');

// Test attribute matching
const match = matchAttribute(mockNode, mockColumn);
expect(match.found).toBe(true);
expect(match.strategy).toBe('attrById');
```

## Future Enhancements

- [ ] Add historical compliance tracking
- [ ] Implement compliance trends/charts
- [ ] Add bulk override operations
- [ ] Export reports in multiple formats (PDF, CSV)
- [ ] Add compliance rule engine
