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
    const [leftWidth, setLeftWidth] = useState(340);
    const [rightWidth, setRightWidth] = useState(340);
    const [resizing, setResizing] = useState<ResizeTarget>(null);
    const resizeRef = useRef({ startX: 0, startWidth: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return;
            const delta = e.clientX - resizeRef.current.startX;
            if (resizing === 'left') {
                const next = Math.min(520, Math.max(240, resizeRef.current.startWidth + delta));
                setLeftWidth(next);
            }
            if (resizing === 'right') {
                const next = Math.min(520, Math.max(240, resizeRef.current.startWidth - delta));
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
            document.body.style.webkitUserSelect = '';
        };
    }, [resizing]);

    const startResize = (target: ResizeTarget, clientX: number, currentWidth: number) => {
        setResizing(target);
        resizeRef.current = { startX: clientX, startWidth: currentWidth };
    };

    const handleResizeStart = (target: ResizeTarget, e: React.MouseEvent | React.TouchEvent, currentWidth: number) => {
        e.preventDefault();
        const point = 'touches' in e ? e.touches[0] : e;
        startResize(target, point.clientX, currentWidth);
    };

    return (
        <div className="relative min-h-screen w-screen overflow-hidden font-sans" style={{
            background: 'linear-gradient(135deg, var(--background) 0%, var(--primary-light) 100%)',
            color: 'var(--text-primary)'
        }}>
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl" style={{ background: 'var(--primary)', opacity: 0.15 }} />
                <div className="absolute right-0 top-10 h-72 w-72 rounded-full blur-3xl" style={{ background: 'var(--secondary)', opacity: 0.1 }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-[80%] blur-3xl" style={{
                    background: 'linear-gradient(90deg, var(--info), var(--primary), var(--info))',
                    opacity: 0.1
                }} />
            </div>

            <div className="relative flex h-screen flex-col gap-4 px-6 pt-5 pb-6">
                <header className="card-static px-5 h-16 flex items-center relative z-50 overflow-visible" style={{ borderRadius: 'var(--radius-lg)' }}>
                    {topNav}
                </header>

                <div className="flex flex-1 gap-4 overflow-hidden items-stretch">
                    {showSidebar && sidebar && (
                        <div className="relative flex h-full" style={{ width: `${leftWidth}px` }}>
                            <aside className="w-full card-static flex flex-col overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                                {sidebar}
                            </aside>
                            <div
                                className="absolute top-0 right-[-6px] h-full w-3 md:w-4 cursor-col-resize flex items-center justify-center group select-none z-20"
                                onMouseDown={(e) => handleResizeStart('left', e, leftWidth)}
                                onTouchStart={(e) => handleResizeStart('left', e, leftWidth)}
                                title="Изменить ширину панели"
                            >
                                <span className="h-16 w-[6px] rounded-full bg-gray-300/40 group-hover:bg-gray-400/70 group-active:bg-gray-500 transition-all shadow-sm" />
                            </div>
                        </div>
                    )}

                    <main className="flex-1 relative flex flex-col overflow-hidden card-static" style={{ borderRadius: 'var(--radius-xl)' }}>
                        {children}
                    </main>

                    {showRightSidebar && rightSidebar && (
                        <div className="relative flex h-full" style={{ width: `${rightWidth}px` }}>
                            <div
                                className="absolute top-0 left-[-6px] h-full w-3 md:w-4 cursor-col-resize flex items-center justify-center group select-none z-20"
                                onMouseDown={(e) => handleResizeStart('right', e, rightWidth)}
                                onTouchStart={(e) => handleResizeStart('right', e, rightWidth)}
                                title="Изменить ширину панели"
                            >
                                <span className="h-16 w-[6px] rounded-full bg-gray-300/40 group-hover:bg-gray-400/70 group-active:bg-gray-500 transition-all shadow-sm" />
                            </div>
                            <aside className="w-full card-static flex flex-col overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                                {rightSidebar}
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
