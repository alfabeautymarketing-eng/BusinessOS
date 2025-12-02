'use client';

import React from 'react';

export default function TopNav() {
    return (
        <div className="flex items-center justify-between w-full">
            {/* Left: Logo & Projects */}
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center font-bold text-xs">
                        B
                    </div>
                    <span className="font-bold tracking-wider text-sm text-gray-200">BUSINESS OS</span>
                </div>

                <nav className="flex items-center space-x-1">
                    {['SK', 'MT', 'SS'].map((project) => (
                        <button
                            key={project}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            {project}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-gray-700 mx-2"></div>
                    <button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-pink-400 hover:text-pink-300 hover:bg-pink-900/20 transition-colors border border-pink-500/20"
                    >
                        Cosmetic Analysis
                    </button>
                </nav>
            </div>

            {/* Right: Status & User */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                    <span className="text-xs text-gray-400 font-mono">System: Online</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                    A
                </div>
            </div>
        </div>
    );
}
