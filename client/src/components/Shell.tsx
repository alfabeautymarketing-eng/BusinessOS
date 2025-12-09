import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface ShellProps {
    children: ReactNode;
    topNav?: ReactNode;
    sidebar?: ReactNode;
    rightSidebar?: ReactNode;
    showSidebar?: boolean;
    showRightSidebar?: boolean;
}

type ResizeTarget = 'left' | 'right' | null;

export default function Shell({ children, sidebar, topNav, rightSidebar, showSidebar = true, showRightSidebar = true }: ShellProps) {
    const [leftWidth, setLeftWidth] = useState(300);
    const [rightWidth, setRightWidth] = useState(360);
    const [resizing, setResizing] = useState<ResizeTarget>(null);
    const resizeRef = useRef({ startX: 0, startWidth: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return;
            const delta = e.clientX - resizeRef.current.startX;
            if (resizing === 'left') {
                const next = Math.min(450, Math.max(240, resizeRef.current.startWidth + delta));
                setLeftWidth(next);
            }
            if (resizing === 'right') {
                const next = Math.min(450, Math.max(280, resizeRef.current.startWidth - delta));
                setRightWidth(next);
            }
        };

        const handleMouseUp = () => setResizing(null);

        if (resizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [resizing]);

    return (
        <div className="flex flex-col h-screen w-full relative">
            {/* Top Navigation Capsule */}
            <div className="shrink-0 z-50 px-6 pt-4 pb-2">
                {topNav}
            </div>

            <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-0 items-stretch">
                {/* Left Sidebar */}
                {showSidebar && sidebar && (
                    <div className="relative shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out mr-1" style={{ width: `${leftWidth}px` }}>
                        <aside className="h-full w-full flex flex-col">
                            {sidebar}
                        </aside>

                        {/* Resizer Handle - LEFT (VSCode style) */}
                        <div
                            className="absolute top-0 right-0 h-full w-1 cursor-col-resize group select-none z-[100] hover:w-1.5 transition-all"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setResizing('left');
                                resizeRef.current = { startX: e.clientX, startWidth: leftWidth };
                            }}
                            title="Изменить ширину панели"
                        >
                            <div
                                className={`h-full w-full transition-all ${
                                    resizing === 'left'
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300/40 group-hover:bg-blue-400'
                                }`}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 relative min-w-0 h-full flex flex-col">
                    {children}
                </main>

                {/* Right Sidebar */}
                {showRightSidebar && rightSidebar && (
                    <div className="relative shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out ml-1" style={{ width: `${rightWidth}px` }}>
                        {/* Resizer Handle - RIGHT (VSCode style) */}
                        <div
                            className="absolute top-0 left-0 h-full w-1 cursor-col-resize group select-none z-[100] hover:w-1.5 transition-all"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setResizing('right');
                                resizeRef.current = { startX: e.clientX, startWidth: rightWidth };
                            }}
                            title="Изменить ширину панели"
                        >
                            <div
                                className={`h-full w-full transition-all ${
                                    resizing === 'right'
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300/40 group-hover:bg-blue-400'
                                }`}
                            />
                        </div>

                        <aside className="h-full w-full flex flex-col">
                            {rightSidebar}
                        </aside>
                    </div>
                )}
            </div>
            {/* Global Overlay to capture mouse events over iframes during resize */}
            {resizing && (
                <div
                    className="fixed inset-0 z-[9999] cursor-col-resize"
                    style={{ userSelect: 'none' }}
                />
            )}
        </div>
    );
}
