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
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing]);

    return (
        <div className="relative min-h-screen w-screen overflow-hidden bg-[#060910] text-white font-sans selection:bg-purple-500/40">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-[80%] bg-gradient-to-r from-cyan-500/10 via-purple-500/8 to-cyan-500/10 blur-3xl" />
            </div>

            <div className="relative flex h-screen flex-col gap-4 px-6 pt-5 pb-6">
                <header className="rounded-2xl border border-white/5 bg-gradient-to-r from-[#0f1523]/90 via-[#0d1220]/85 to-[#0b0f1b]/90 shadow-[0_10px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl px-5 h-16 flex items-center">
                    {topNav}
                </header>

                <div className="flex flex-1 gap-4 overflow-hidden items-stretch">
                    {showSidebar && sidebar && (
                        <div className="relative flex h-full" style={{ width: `${leftWidth}px` }}>
                            <aside className="w-full rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-[#0f1524]/85 via-[#0c1220]/85 to-[#0a101b]/90 backdrop-blur-2xl flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
                                {sidebar}
                            </aside>
                            <div
                                className="absolute top-0 right-[-8px] h-full w-3 cursor-col-resize rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center"
                                onMouseDown={(e) => {
                                    setResizing('left');
                                    resizeRef.current = { startX: e.clientX, startWidth: leftWidth };
                                }}
                                title="Изменить ширину панели"
                            >
                                <span className="h-10 w-[2px] rounded-full bg-white/40" />
                            </div>
                        </div>
                    )}

                    <main className="flex-1 relative flex flex-col rounded-3xl bg-[#05070e]/60 border border-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden backdrop-blur-xl">
                        {children}
                    </main>

                    {showRightSidebar && rightSidebar && (
                        <div className="relative flex h-full" style={{ width: `${rightWidth}px` }}>
                            <div
                                className="absolute top-0 left-[-8px] h-full w-3 cursor-col-resize rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center"
                                onMouseDown={(e) => {
                                    setResizing('right');
                                    resizeRef.current = { startX: e.clientX, startWidth: rightWidth };
                                }}
                                title="Изменить ширину панели"
                            >
                                <span className="h-10 w-[2px] rounded-full bg-white/40" />
                            </div>
                            <aside className="w-full rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0f1324]/85 via-[#0d1020]/85 to-[#0b0d18]/90 backdrop-blur-2xl flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
                                {rightSidebar}
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
