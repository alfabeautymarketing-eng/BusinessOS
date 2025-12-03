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
        };
    }, [resizing]);

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
                <header className="card-static px-5 h-16 flex items-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                    {topNav}
                </header>

                <div className="flex flex-1 gap-4 overflow-hidden items-stretch">
                    {showSidebar && sidebar && (
                        <div className="relative flex h-full" style={{ width: `${leftWidth}px` }}>
                            <aside className="w-full card-static flex flex-col overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                                {sidebar}
                            </aside>
                            <div
                                className="absolute top-0 right-[-10px] h-full w-5 cursor-col-resize flex items-center justify-center group select-none"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setResizing('left');
                                    resizeRef.current = { startX: e.clientX, startWidth: leftWidth };
                                }}
                                title="Изменить ширину панели"
                            >
                                <span className="h-12 w-[2px] rounded-full bg-white/20 group-hover:bg-white/70 transition-colors" />
                            </div>
                        </div>
                    )}

                    <main className="flex-1 relative flex flex-col overflow-hidden card-static" style={{ borderRadius: 'var(--radius-xl)' }}>
                        {children}
                    </main>

                    {showRightSidebar && rightSidebar && (
                        <div className="relative flex h-full" style={{ width: `${rightWidth}px` }}>
                            <div
                                className="absolute top-0 left-[-10px] h-full w-5 cursor-col-resize flex items-center justify-center group select-none"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setResizing('right');
                                    resizeRef.current = { startX: e.clientX, startWidth: rightWidth };
                                }}
                                title="Изменить ширину панели"
                            >
                                <span className="h-12 w-[2px] rounded-full bg-white/20 group-hover:bg-white/70 transition-colors" />
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
