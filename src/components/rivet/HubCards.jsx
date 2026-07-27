import React from 'react';
import { Hammer, Brain, ArrowRight } from 'lucide-react';

export default function HubCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Build Hub */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
            <Hammer className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Build Hub</h3>
          <p className="text-sm text-gray-500 mb-4">Create. Collaborate. Build together.</p>
          <button className="text-white px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5">
            Explore Build Hub <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Training Hub */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Training Hub</h3>
          <p className="text-sm text-gray-500 mb-4">Train AI. Improve the future.</p>
          <button className="text-white px-4 py-2 rounded-lg text-sm font-medium bg-violet-500 hover:bg-violet-600 transition-colors inline-flex items-center gap-1.5">
            Explore Training Hub <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}