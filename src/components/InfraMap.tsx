import { useEffect, useState, memo, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    type Node,
    type Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    type EdgeProps,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Server, Share2, Layers, Database, Globe, Filter,
    Eye, EyeOff, Activity, MousePointer2, Move, Edit2
} from 'lucide-react';

interface InfraMapProps {
    jsonData: string;
    onJsonChange?: (value: string) => void;
}

interface Waypoint {
    x: number;
    y: number;
}

export interface NetworkInterface {
    id: string;
    name: string;
    type: 'COPPER' | 'FIBER' | 'VIRTUAL';
    status: 'ACTIVE' | 'INACTIVE';
}

export interface InfraNodeData {
    id: string;
    type: string;
    name: string;
    ip?: string;
    status?: 'ON' | 'OFF' | 'MAINTENANCE';
    criticality?: 'LOW' | 'MEDIUM' | 'HIGH';
    attributes?: any[];
    interfaces?: NetworkInterface[];
}

// --- Custom Premium Node ---
const CustomNode = memo(({ data }: { data: InfraNodeData }) => {
    const Icon = data.type === 'SWITCH' ? Share2 : data.type === 'ROUTER' ? Globe : data.type === 'PHYSICAL_SERVER' ? Server : data.type === 'VIRTUAL_MACHINE' ? Layers : Database;
    const accentColor = data.type === 'SWITCH' ? 'border-[var(--primary)]/50' : data.type === 'PHYSICAL_SERVER' ? 'border-[var(--status-warn)]/50' : data.type === 'VIRTUAL_MACHINE' ? 'border-[var(--accent)]/50' : 'border-[var(--text-dim)]/50';

    return (
        <div className={`relative group px-4 py-3 rounded-2xl border ${accentColor} bg-[var(--bg-card)]/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[var(--bg-card)]/60 ring-1 ring-white/5`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>

            {/* Standard Handles */}
            <Handle type="target" position={Position.Left} id="target-main" className="w-2 h-2 !bg-[var(--primary)] !border-none" />
            <Handle type="source" position={Position.Right} id="source-main" className="w-2 h-2 !bg-[var(--primary)] !border-none" />

            {/* Dynamic Interface Handles */}
            {data.interfaces && data.interfaces.map((iface, idx) => (
                <div key={iface.id}>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`source-${iface.id}`}
                        style={{ top: 40 + (idx * 20), right: -4 }}
                        className={`w-1.5 h-1.5 !border-none ${iface.status === 'ACTIVE' ? '!bg-[var(--status-warn)] shadow-[0_0_5px_var(--status-warn)]' : '!bg-[var(--text-dim)]/50'}`}
                        title={`Port: ${iface.name} (${iface.type})`}
                    />
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={`target-${iface.id}`}
                        style={{ top: 40 + (idx * 20), left: -4 }}
                        className={`w-1.5 h-1.5 !border-none ${iface.status === 'ACTIVE' ? '!bg-[var(--status-warn)] shadow-[0_0_5px_var(--status-warn)]' : '!bg-[var(--text-dim)]/50'}`}
                        title={`Port: ${iface.name} (${iface.type})`}
                    />
                </div>
            ))}

            <div className="flex items-center gap-3 relative">
                <div className={`w-8 h-8 rounded-lg bg-[var(--bg-deep)] border ${accentColor} flex items-center justify-center text-[var(--text-bright)]/80 group-hover:text-[var(--text-bright)] transition-colors`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-wider truncate">{data.name}</h4>
                    <p className="text-[9px] font-mono text-[var(--text-dim)]">{data.ip || 'no-ip'}</p>
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-[var(--primary)] !border-none" />
        </div>
    );
});

// --- Custom Waypoint Edge ---
const CustomWaypointEdge = memo(({
    id, sourceX, sourceY, targetX, targetY, data, style, label, markerEnd
}: EdgeProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const waypoints = data?.waypoints || [];
    const isDesignMode = data?.isDesignMode;

    // Build the SVG path from source -> waypoints -> target
    let d = `M ${sourceX},${sourceY}`;
    waypoints.forEach((p: any) => {
        d += ` L ${p.x},${p.y}`;
    });
    d += ` L ${targetX},${targetY}`;

    const color = data?.color || style?.stroke || '#3b82f6';

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    stroke: color,
                    strokeWidth: isHovered && isDesignMode ? 6 : (style?.strokeWidth || 3),
                    pointerEvents: 'none',
                    transition: 'stroke-width 0.2s ease'
                }}
                className="react-flow__edge-path"
                d={d}
                markerEnd={markerEnd}
            />
            {/* Consolidated interaction path for design mode */}
            {isDesignMode && (
                <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    className="cursor-crosshair"
                    style={{ pointerEvents: 'all' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (e.shiftKey) {
                            data?.onEdgeDelete?.(id);
                        } else {
                            data?.onEdgeClick?.(e, id, { sourceX, sourceY, targetX, targetY });
                        }
                    }}
                />
            )}
            {(label || data?.routeName) && (
                <text dy="-4" style={{ pointerEvents: 'none' }}>
                    <textPath
                        href={`#${id}`}
                        style={{
                            fontSize: '9px',
                            fontWeight: '900',
                            fill: color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            paintOrder: 'stroke',
                            stroke: 'var(--bg-main)',
                            strokeWidth: '3px',
                            strokeLinejoin: 'round'
                        }}
                        startOffset="50%"
                        textAnchor="middle"
                    >
                        {data?.routeName ? `⚡ ${data.routeName} • ${label || ''}` : label}
                    </textPath>
                </text>
            )}

            {/* Render interactive handles for waypoints in design mode */}
            {isDesignMode && waypoints.map((p: any, i: number) => (
                <g key={`${id}-wp-${i}`} className="cursor-move">
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 8 : 6}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={2}
                        className="transition-all duration-200"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            data?.onWaypointMouseDown?.(e, id, i);
                        }}
                    />
                </g>
            ))}
        </>
    );
});


const InfraMapContent = ({ jsonData, onJsonChange }: InfraMapProps) => {
    const nodeTypes = useMemo(() => ({ infraNode: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ waypointEdge: CustomWaypointEdge }), []);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
    const [hiddenRoutes, setHiddenRoutes] = useState<Set<string>>(new Set());
    const [isDesignMode, setIsDesignMode] = useState(false);
    const [draggingWaypoint, setDraggingWaypoint] = useState<{ edgeId: string, index: number } | null>(null);
    const [tempWaypoints, setTempWaypoints] = useState<Waypoint[]>([]);
    const [mousePos, setMousePos] = useState<Waypoint>({ x: 0, y: 0 });
    const isConnectingRef = useRef(false);

    const { screenToFlowPosition } = useReactFlow();

    // Use refs for values needed in handlers to avoid unnecessary re-creations and re-renders
    const dataRef = useRef(jsonData);
    const edgesRef = useRef(edges);
    const onJsonChangeRef = useRef(onJsonChange);
    const designModeRef = useRef(isDesignMode);

    useEffect(() => { dataRef.current = jsonData; }, [jsonData]);
    useEffect(() => { edgesRef.current = edges; }, [edges]);
    useEffect(() => { onJsonChangeRef.current = onJsonChange; }, [onJsonChange]);
    useEffect(() => { designModeRef.current = isDesignMode; }, [isDesignMode]);

    // --- CONNECTION LINE COMPONENT (Inner to access tempWaypoints) ---
    const ConnectionLine = useCallback(({ fromX, fromY, toX, toY, connectionLineStyle }: any) => {
        let d = `M ${fromX},${fromY}`;
        tempWaypoints.forEach((p: any) => {
            d += ` L ${p.x},${p.y}`;
        });
        d += ` L ${toX},${toY}`;

        return (
            <g>
                <path
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    className="animated"
                    d={d}
                    style={{ ...connectionLineStyle, strokeDasharray: '5,5' }}
                />
                {tempWaypoints.map((p: any, i: number) => (
                    <circle key={`temp-wp-${i}`} cx={p.x} cy={p.y} r={3} fill="#3b82f6" opacity={0.5} />
                ))}
                <circle cx={toX} cy={toY} fill="#fff" r={4} stroke="#3b82f6" strokeWidth={2} className="animate-pulse" />
            </g>
        );
    }, [tempWaypoints]);

    // --- HANDLERS (Defined before parseData) ---

    const handleEdgeClick = useCallback((e: React.MouseEvent, edgeId: string, coords: { sourceX: number, sourceY: number, targetX: number, targetY: number }) => {
        if (!designModeRef.current) return;
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

        try {
            const data = JSON.parse(dataRef.current);
            const edgeIdx = parseInt(edgeId.split('-')[1]);
            const link = data.links[edgeIdx];
            if (!link) return;
            const waypoints = link.waypoints || [];

            const points = [
                { x: coords.sourceX, y: coords.sourceY },
                ...waypoints,
                { x: coords.targetX, y: coords.targetY }
            ];

            let bestIndex = 0;
            let minDistanceToSegment = Infinity;

            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const L2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
                if (L2 === 0) continue;

                const t = ((position.x - p1.x) * (p2.x - p1.x) + (position.y - p1.y) * (p2.y - p1.y)) / L2;
                const projectionT = Math.max(0, Math.min(1, t));
                const projection = {
                    x: p1.x + projectionT * (p2.x - p1.x),
                    y: p1.y + projectionT * (p2.y - p1.y)
                };

                const dist = Math.sqrt(Math.pow(position.x - projection.x, 2) + Math.pow(position.y - projection.y, 2));
                if (dist < minDistanceToSegment) {
                    minDistanceToSegment = dist;
                    bestIndex = i;
                }
            }

            const newWaypoints = [...waypoints];
            newWaypoints.splice(bestIndex, 0, { x: position.x, y: position.y });
            data.links[edgeIdx].waypoints = newWaypoints;
            onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Handler Error", err);
        }
    }, [screenToFlowPosition]);

    const handleWaypointMouseDown = useCallback((e: React.MouseEvent, edgeId: string, index: number) => {
        if (e.shiftKey) {
            try {
                const data = JSON.parse(dataRef.current);
                const edgeIdx = parseInt(edgeId.split('-')[1]);
                if (data.links[edgeIdx]?.waypoints) {
                    data.links[edgeIdx].waypoints.splice(index, 1);
                    onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
                }
            } catch (err) { }
            return;
        }
        setDraggingWaypoint({ edgeId, index });
    }, []);

    const handleEdgeDelete = useCallback((edgeId: string) => {
        try {
            const data = JSON.parse(dataRef.current);
            const edgeIdx = parseInt(edgeId.split('-')[1]);
            if (data.links[edgeIdx]) {
                data.links.splice(edgeIdx, 1);
                onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
            }
        } catch (e) { }
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingWaypoint || !designModeRef.current) return;

        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

        setEdges(eds => eds.map(edge => {
            if (edge.id === draggingWaypoint.edgeId) {
                const newWaypoints = [...(edge.data.waypoints || [])];
                newWaypoints[draggingWaypoint.index] = { x: position.x, y: position.y };
                return { ...edge, data: { ...edge.data, waypoints: newWaypoints } };
            }
            return edge;
        }));
    }, [draggingWaypoint, setEdges, screenToFlowPosition]);

    const onMouseUp = useCallback(() => {
        if (draggingWaypoint) {
            const edge = edgesRef.current.find(e => e.id === draggingWaypoint.edgeId);
            const finalPoint = edge?.data.waypoints[draggingWaypoint.index];

            if (finalPoint) {
                try {
                    const data = JSON.parse(dataRef.current);
                    const edgeIdx = parseInt(draggingWaypoint.edgeId.split('-')[1]);
                    if (data.links[edgeIdx]) {
                        data.links[edgeIdx].waypoints[draggingWaypoint.index] = finalPoint;
                        onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
                    }
                } catch (e) { }
            }
            setDraggingWaypoint(null);
        }
    }, [draggingWaypoint]);

    const onConnect = useCallback((params: any) => {
        try {
            const data = JSON.parse(dataRef.current);
            const sourceId = params.source.replace('flow-', '');
            const targetId = params.target.replace('flow-', '');
            const sourceHandle = params.sourceHandle ? params.sourceHandle.replace('source-', '') : null;
            const targetHandle = params.targetHandle ? params.targetHandle.replace('target-', '') : null;

            const newLink = {
                sourceId,
                targetId,
                sourceHandle: sourceHandle === 'main' ? null : sourceHandle,
                targetHandle: targetHandle === 'main' ? null : targetHandle,
                type: 'LOGICAL',
                routeName: 'NEW CONNECTION',
                color: '#3b82f6',
                waypoints: [...tempWaypoints] // Use accumulated waypoints
            };

            data.links = [...(data.links || []), newLink];
            onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
            setTempWaypoints([]);
            isConnectingRef.current = false;
        } catch (e) {
            console.error("Connection Error", e);
        }
    }, [tempWaypoints]);

    const onConnectStart = useCallback(() => {
        isConnectingRef.current = true;
        setTempWaypoints([]);
    }, []);

    const onConnectEnd = useCallback(() => {
        // We handle reset in onConnect, but if it fails/cancels we reset here too
        setTimeout(() => {
            if (isConnectingRef.current) {
                isConnectingRef.current = false;
                setTempWaypoints([]);
            }
        }, 100);
    }, []);

    // Listen for Space key during connection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isConnectingRef.current) {
                e.preventDefault();
                setTempWaypoints(prev => [...prev, { x: mousePos.x, y: mousePos.y }]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mousePos]);

    const onGlobalMouseMove = useCallback((e: React.MouseEvent) => {
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setMousePos(pos);
        if (draggingWaypoint && designModeRef.current) {
            onMouseMove(e);
        }
    }, [draggingWaypoint, onMouseMove, screenToFlowPosition]);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: any) => {
        try {
            const data = JSON.parse(dataRef.current);
            const edgeIdx = parseInt(oldEdge.id.split('-')[1]);
            if (data.links[edgeIdx]) {
                data.links[edgeIdx].sourceId = newConnection.source.replace('flow-', '');
                data.links[edgeIdx].targetId = newConnection.target.replace('flow-', '');
                data.links[edgeIdx].sourceHandle = newConnection.sourceHandle ? newConnection.sourceHandle.replace('source-', '') : null;
                data.links[edgeIdx].targetHandle = newConnection.targetHandle ? newConnection.targetHandle.replace('target-', '') : null;
                onJsonChangeRef.current?.(JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error("Reconnect Error", e);
        }
    }, []);

    // --- ENGINE: Parse data into React Flow format ---

    const parseData = useCallback((data: any, filters: Set<string>, designMode: boolean) => {
        const popAreas = data.pops || [];
        const links = data.links || [];
        const flowNodes: Node[] = [];
        const flowEdges: Edge[] = [];

        const LAYER_WIDTH = 450;
        const NODE_HEIGHT = 120;
        const POP_SPACING = 400;

        popAreas.forEach((pop: any, pIdx: number) => {
            const popId = `pop-${pop.id}`;
            flowNodes.push({
                id: popId, type: 'group', data: { label: pop.name },
                position: { x: pIdx * (LAYER_WIDTH * 4 + POP_SPACING), y: -100 },
                style: { width: LAYER_WIDTH * 4, height: 2500, backgroundColor: 'rgba(37, 99, 235, 0.02)', border: '2px dashed rgba(37, 99, 235, 0.2)', borderRadius: '60px', zIndex: -1 }
            });

            flowNodes.push({
                id: `${popId}-label`, parentId: popId, draggable: false,
                data: { label: <div className="flex flex-col items-center"><span className="text-[14px] font-black text-blue-400 uppercase tracking-[0.5em]">{pop.name}</span><span className="text-[10px] text-gray-600 font-bold uppercase">{pop.city}</span></div> },
                position: { x: (LAYER_WIDTH * 4) / 2 - 100, y: 20 },
                style: { background: 'none', border: 'none', width: 220, pointerEvents: 'none' }
            });

            let globalY = 150;
            const processNode = (node: any, depth: number, parentId: string) => {
                const typeKey = node.type.toUpperCase();
                const isVisible = !filters.has(typeKey);
                const nodeId = `flow-${node.id}`;
                if (isVisible) {
                    flowNodes.push({
                        id: nodeId, parentId: popId, type: 'infraNode',
                        data: { ...node, type: typeKey },
                        position: { x: depth * LAYER_WIDTH + 60, y: globalY },
                        style: { width: 240 }
                    });

                    if (parentId !== popId) {
                        flowEdges.push({
                            id: `e-${parentId}-${nodeId}`, source: parentId, target: nodeId,
                            type: 'smoothstep', animated: node.status === 'ON',
                            style: { stroke: node.type === 'VIRTUAL_MACHINE' ? '#f59e0b' : '#3b82f6', strokeWidth: 2, opacity: 0.3 }
                        });
                    }
                }
                const children = node.children || node.connected_devices || node.connected_servers || node.virtual_machines || node.systems || [];
                if (children.length > 0) children.forEach((child: any) => processNode(child, depth + 1, nodeId));
                else if (isVisible) globalY += NODE_HEIGHT;
            };
            (pop.nodes || []).forEach((node: any) => { processNode(node, 0, popId); globalY += 80; });
        });

        links.forEach((link: any, idx: number) => {
            if (hiddenRoutes.has(link.routeName || 'UNNAMED')) return;

            const sourceId = `flow-${link.sourceId}`;
            const targetId = `flow-${link.targetId}`;
            if (flowNodes.some(n => n.id === sourceId) && flowNodes.some(n => n.id === targetId)) {
                flowEdges.push({
                    id: `logical-${idx}`,
                    source: sourceId,
                    target: targetId,
                    sourceHandle: link.sourceHandle ? `source-${link.sourceHandle}` : 'source-main',
                    targetHandle: link.targetHandle ? `target-${link.targetHandle}` : 'target-main',
                    type: 'waypointEdge',
                    label: link.label,
                    data: {
                        waypoints: link.waypoints || [],
                        color: link.color,
                        routeName: link.routeName,
                        isDesignMode: designMode,
                        onEdgeClick: handleEdgeClick,
                        onEdgeDelete: handleEdgeDelete,
                        onWaypointMouseDown: handleWaypointMouseDown
                    },
                    style: { stroke: link.color || '#3b82f6', strokeWidth: link.routeName ? 4 : 3, strokeDasharray: link.type === 'LOGICAL' ? '10,5' : 'none', opacity: 0.8 },
                    animated: true
                });
            }
        });

        return { flowNodes, flowEdges };
    }, [handleEdgeClick, handleEdgeDelete, handleWaypointMouseDown, hiddenRoutes]);

    useEffect(() => {
        try {
            const data = JSON.parse(jsonData);
            const { flowNodes, flowEdges } = parseData(data, hiddenTypes, isDesignMode);
            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (e) {
            console.error("Layout Engine Error", e);
        }
    }, [jsonData, hiddenTypes, hiddenRoutes, isDesignMode, parseData]);



    const toggleFilter = (type: string) => {
        setHiddenTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const toggleRouteFilter = (routeName: string) => {
        setHiddenRoutes(prev => {
            const next = new Set(prev);
            if (next.has(routeName)) next.delete(routeName);
            else next.add(routeName);
            return next;
        });
    };

    const routes = useMemo(() => {
        try {
            const data = JSON.parse(jsonData);
            const r = new Set<string>();
            (data.links || []).forEach((l: any) => {
                if (l.routeName) r.add(l.routeName);
            });
            return Array.from(r);
        } catch (e) { return []; }
    }, [jsonData]);

    const types = ['SWITCH', 'PHYSICAL_SERVER', 'VIRTUAL_MACHINE', 'SYSTEM'];

    return (
        <div
            className="w-full h-full bg-[var(--bg-main)] relative"
            onMouseMove={onGlobalMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onReconnect={onReconnect}
                onPaneMouseMove={draggingWaypoint ? onMouseMove : undefined}
                connectionLineComponent={ConnectionLine}
                fitView
                minZoom={0.05}
                maxZoom={2}
                panOnScroll
                selectionOnDrag
            >
                <Background color="var(--border-main)" gap={40} size={1} />
                <Controls className="!bg-[var(--bg-sidebar)] !border-[var(--border-main)] !fill-[var(--text-main)]" />
            </ReactFlow>

            {/* Floating UI */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 z-20">
                <div className="p-4 bg-[var(--bg-card)]/80 backdrop-blur-2xl border border-[var(--border-main)] rounded-[2rem] shadow-2xl space-y-4 w-64">
                    <div className="flex items-center gap-2 border-b border-[var(--border-main)] pb-3">
                        <Filter className="w-4 h-4 text-[var(--primary)]" />
                        <h3 className="text-xs font-black text-[var(--text-bright)] uppercase tracking-tighter">Topology Control</h3>
                    </div>

                    <div className="space-y-1">
                        <button
                            onClick={() => setIsDesignMode(!isDesignMode)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isDesignMode ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-deep)] border-[var(--border-main)] text-[var(--text-dim)]'}`}
                        >
                            <div className="flex items-center gap-2">
                                {isDesignMode ? <Move className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{isDesignMode ? 'Design Active' : 'View Mode'}</span>
                            </div>
                            {isDesignMode && <Activity className="w-3 h-3 animate-pulse" />}
                        </button>
                        <p className="text-[8px] text-[var(--text-dim)] font-bold uppercase tracking-widest px-2 mt-1">
                            {isDesignMode ? 'Click edge to add waypoint • Drag point to move • Shift+Click to remove' : 'Switch to Design Mode to organize paths'}
                        </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-2 px-2 py-1">
                            <Layers className="w-3 h-3 text-[var(--primary)]" />
                            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Type Visibility</span>
                        </div>
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => toggleFilter(t)}
                                className={`w-full flex items-center justify-between p-2 rounded-xl border border-transparent transition-all ${!hiddenTypes.has(t) ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text-dim)]'}`}
                            >
                                <span className="text-[9px] font-bold uppercase tracking-widest">{t.replace('_', ' ')}</span>
                                {!hiddenTypes.has(t) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>

                    {routes.length > 0 && (
                        <div className="space-y-1.5 pt-4 border-t border-[var(--border-main)]">
                            <div className="flex items-center gap-2 px-2 py-1">
                                <Share2 className="w-3 h-3 text-[var(--accent)]" />
                                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Logical Routes</span>
                            </div>
                            {routes.map(r => (
                                <div key={r} className="flex items-center gap-2 group/route">
                                    <button
                                        onClick={() => toggleRouteFilter(r)}
                                        className={`flex-1 flex items-center gap-2 p-2 rounded-lg transition-all ${hiddenRoutes.has(r) ? 'bg-[var(--bg-deep)] text-[var(--text-dim)]' : 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'}`}
                                    >
                                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ backgroundColor: 'currentColor' }}></div>
                                        <span className="text-[10px] font-black uppercase truncate">{r}</span>
                                    </button>
                                    {isDesignMode && (
                                        <button
                                            onClick={() => {
                                                const newName = prompt(`Rename route "${r}" to:`, r);
                                                if (newName && newName !== r) {
                                                    try {
                                                        const data = JSON.parse(jsonData);
                                                        data.links = data.links.map((l: any) => l.routeName === r ? { ...l, routeName: newName } : l);
                                                        onJsonChange?.(JSON.stringify(data, null, 2));
                                                    } catch (e) { }
                                                }
                                            }}
                                            className="p-2 bg-[var(--bg-deep)] hover:bg-[var(--bg-sidebar)] text-[var(--text-dim)] rounded-lg opacity-0 group-hover/route:opacity-100 transition-opacity"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Design Mode Indicator */}
            {isDesignMode && (
                <div className="absolute top-8 right-8 px-6 py-3 bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20 rounded-full flex items-center gap-3 backdrop-blur-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[var(--status-warn)] shadow-[0_0_8px_var(--status-warn)]" />
                    <span className="text-[10px] font-black text-[var(--status-warn)] uppercase tracking-widest">Architectural Adjustment Mode</span>
                </div>
            )}
        </div>
    );
};

export const InfraMap = (props: InfraMapProps) => (
    <ReactFlowProvider>
        <InfraMapContent {...props} />
    </ReactFlowProvider>
);
