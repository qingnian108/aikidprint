import React, { memo } from 'react';
import { GeneratedPage, GeneratedItem, WorksheetType } from '../types';
import { APP_NAME } from '../constants';

interface Props {
  page: GeneratedPage;
  showWatermark?: boolean;
}

const WorksheetRenderer: React.FC<Props> = memo(({ page, showWatermark = true }) => {
  return (
    <div className="bg-white w-full h-full relative p-6 md:p-8 flex flex-col box-border overflow-hidden print:w-[190mm] print:h-[270mm] print:max-h-[270mm] print:mx-auto print:overflow-hidden">
      {/* Header - Compacted */}
      <div className="border-b-2 border-black pb-2 mb-6 flex justify-between items-end flex-shrink-0">
        <div className="max-w-[70%]">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-black tracking-tight leading-none mb-1">{page.title}</h2>
          <p className="text-slate-600 font-medium text-lg font-display leading-tight">{page.instructions}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium mb-1 font-mono">Name: __________________</div>
          <div className="text-xs text-slate-400 font-medium font-mono">Date: __________________</div>
        </div>
      </div>

      {/* Content Area - Constrained flex grow */}
      <div className="flex-grow relative flex flex-col min-h-0">
        
        {/* --- MATH RENDERER --- */}
        {page.type === WorksheetType.MATH && (
          <div className="grid grid-cols-2 gap-4 md:gap-6 h-full pb-2">
            {page.items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex flex-col items-center justify-center border-4 border-slate-100 rounded-3xl p-2 relative bg-slate-50 h-full w-full">
                 {/* Decorative Icon Background */}
                 <div className="absolute top-2 left-3 opacity-20 text-3xl grayscale filter blur-[1px] select-none pointer-events-none">
                   {item.icon || '?'}
                 </div>
                 
                 {/* Main Content */}
                 <div className="text-center z-10 flex flex-col items-center gap-2">
                   <div className="text-5xl md:text-6xl animate-bounce-slow">
                     {item.icon}
                   </div>

                   <span className="text-4xl md:text-5xl font-bold text-slate-800 font-display tracking-wider whitespace-nowrap">
                      {item.question}
                   </span>
                 </div>
                 
                 {/* Answer Box */}
                 <div className="mt-4 w-16 h-16 border-2 border-black border-dashed rounded-xl bg-white"></div>
              </div>
            ))}
          </div>
        )}

        {/* --- TRACING RENDERER --- */}
        {page.type === WorksheetType.TRACING && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full py-2">
            {page.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-2 border-slate-100 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center justify-start w-full gap-3">
                  {/* The Letter/Word + Icon */}
                  <div className="h-20 w-20 flex-shrink-0 flex flex-col items-center justify-center border-4 border-slate-100 rounded-2xl bg-slate-50 relative overflow-hidden">
                    <span className="text-4xl font-bold text-slate-800 font-display relative z-10 leading-none">{item.text?.charAt(0)}</span>
                    {item.icon && (
                      <div className="absolute bottom-1 right-1 text-lg opacity-80">{item.icon}</div>
                    )}
                  </div>
                  
                  {/* Tracing Lines */}
                  <div className="w-full flex flex-col justify-center">
                    <div className="h-20 w-full relative flex items-center border-b-2 border-t-2 border-dashed border-slate-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmU4ZjAiLz4KPC9zdmc+')] overflow-hidden rounded-xl">
                         <span className="text-[2.2rem] md:text-[2.6rem] font-display text-slate-200 tracking-[0.08em] absolute w-full top-1/2 -translate-y-1/2 px-2 text-center select-none whitespace-nowrap"
                               style={{ 
                                 fontFamily: '"Fredoka", sans-serif',
                                 WebkitTextStroke: '1px #cbd5e1'
                               }}>
                             {item.text}
                         </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- COLORING RENDERER --- */}
        {page.type === WorksheetType.COLORING && (
            <div className="flex flex-col items-center justify-center h-full w-full min-h-0">
               {/* Image Container - Use flex-1 and min-h-0 to prevent overflow */}
               <div className="flex-1 w-full border-4 border-black flex items-center justify-center relative overflow-hidden bg-white rounded-xl shadow-sm min-h-0">
                  {page.items[0]?.imageUrl ? (
                      <img 
                        src={page.items[0].imageUrl} 
                        alt="Coloring Page" 
                        className="w-full h-full object-contain p-4"
                      />
                  ) : (
                     <div className="text-center p-10">
                        <p className="font-mono text-slate-400">Generating image...</p>
                     </div>
                  )}
               </div>
               {/* Theme Label - Compact */}
               <p className="mt-4 font-display text-xl text-black font-bold text-center w-full border-2 border-dashed border-slate-300 p-2 rounded-lg flex-shrink-0">
                 {page.theme.toUpperCase()}
               </p>
            </div>
        )}
      </div>

      {/* Footer / Watermark */}
      <div className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center flex-shrink-0">
        <span className="text-[10px] text-black font-bold font-mono uppercase">Generated by {APP_NAME}</span>
        <span className="text-[10px] text-black font-bold font-mono">Page {page.pageNumber}</span>
      </div>

      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <div className="opacity-[0.03] text-black font-display font-bold text-6xl -rotate-45 select-none whitespace-nowrap">
            {APP_NAME} - Free Version
          </div>
        </div>
      )}
    </div>
  );
});

WorksheetRenderer.displayName = 'WorksheetRenderer';

export default WorksheetRenderer;