import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data - Replace with your Sanity.io fetch later
const SOFTWARE_PROJECTS = [
  { id: 1, title: "RPG Engine", desc: "C++ State Management & Collision", tech: "C++" },
  { id: 2, title: "Cho Dai Di", desc: "Card game logic with Pygame", tech: "Python" }
];

const JOURNALISM_PROJECTS = [
  { id: 3, title: "Bengaluru AI Failures", pub: "Investigative", readTime: "8 min" },
  { id: 4, title: "Urban Development in Selangor", pub: "Feature", readTime: "12 min" }
];

export default function ProjectsWindow() {
  const [activeTab, setActiveTab] = useState('software');

  return (
    <div className="max-w-4xl mx-auto mt-10 border border-gray-200 rounded-xl shadow-2xl bg-white overflow-hidden">
      {/* 1. Window Header (The "OS" Look) */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-sm font-medium text-gray-500 font-mono tracking-tight">projects.exe</span>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-100">
        {['software', 'journalism'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 text-sm font-semibold transition-all capitalize ${
              activeTab === tab 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Content Area */}
      <div className="p-6 h-[500px] overflow-y-auto bg-gray-50/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {activeTab === 'software' ? (
              SOFTWARE_PROJECTS.map(proj => (
                <div key={proj.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg">{proj.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{proj.desc}</p>
                  <span className="inline-block mt-3 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-mono rounded">{proj.tech}</span>
                </div>
              ))
            ) : (
              JOURNALISM_PROJECTS.map(article => (
                <div key={article.id} className="p-4 bg-white border-l-4 border-black border rounded-r-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{article.pub}</span>
                  <h3 className="font-serif text-xl font-medium group-hover:underline">{article.title}</h3>
                  <p className="text-gray-500 text-xs mt-2 italic">{article.readTime} read</p>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}