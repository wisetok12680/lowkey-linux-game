import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, HardDrive, Eye, ChevronRight, Info, Copy, Check } from 'lucide-react';

export default function RangerView({ gameState, setGameState }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showHidden, setShowHidden] = useState(true);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const cwdNode = gameState.vfs.getNode(gameState.cwd);
  const parentNodePath = gameState.cwd === '/' ? null : gameState.cwd.substring(0, gameState.cwd.lastIndexOf('/')) || '/';

  const handleNavigate = (targetPath) => {
    const targetNode = gameState.vfs.getNode(targetPath);
    if (targetNode && targetNode.type === 'dir') {
      setGameState(prev => ({
        ...prev,
        prevCwd: prev.cwd,
        cwd: targetPath
      }));
    }
  };

  const getOctalPermissions = (permStr) => {
    if (!permStr || permStr.length !== 9) return '755';
    const charToBit = (char, val) => (char !== '-' ? val : 0);
    const u = charToBit(permStr[0], 4) + charToBit(permStr[1], 2) + charToBit(permStr[2], 1);
    const g = charToBit(permStr[3], 4) + charToBit(permStr[4], 2) + charToBit(permStr[5], 1);
    const o = charToBit(permStr[6], 4) + charToBit(permStr[7], 2) + charToBit(permStr[8], 1);
    return `${u}${g}${o}`;
  };

  const handleCopyPreview = (content) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 1500);
  };

  const childrenEntries = cwdNode && cwdNode.children ? Object.values(cwdNode.children) : [];
  const filteredEntries = childrenEntries.filter(e => showHidden || !e.name.startsWith('.'));
  const pathParts = gameState.cwd.split('/').filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] border border-[#1e2638] rounded-lg shadow-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#12161f] border-b border-[#1e2638] select-none">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">File Manager (RANGER View)</span>
        </div>

        <button 
          onClick={() => setShowHidden(!showHidden)}
          className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition ${
            showHidden ? 'bg-slate-800 border-slate-700 text-sky-400' : 'border-slate-800 text-slate-500'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>{showHidden ? 'Hidden Files' : 'Show Hidden'}</span>
        </button>
      </div>

      {/* Breadcrumb Path Bar */}
      <div className="px-3.5 py-1.5 bg-[#10141d] border-b border-[#1e2638] flex items-center gap-1 text-xs font-mono overflow-x-auto">
        <button 
          onClick={() => handleNavigate('/')}
          className={`hover:text-sky-400 transition ${gameState.cwd === '/' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}
        >
          /
        </button>
        {pathParts.map((part, idx) => {
          const pathTillNow = '/' + pathParts.slice(0, idx + 1).join('/');
          const isLast = idx === pathParts.length - 1;
          return (
            <React.Fragment key={pathTillNow}>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <button
                onClick={() => handleNavigate(pathTillNow)}
                className={`hover:text-sky-400 transition whitespace-nowrap ${
                  isLast ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {part}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Directory Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Browser List */}
        <div className="flex-1 overflow-y-auto p-1.5">
          {parentNodePath && (
            <div 
              onClick={() => handleNavigate(parentNodePath)}
              className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer text-xs font-mono text-slate-500 transition select-none"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-500/80" />
                <span>.. (Parent Directory)</span>
              </div>
              <span>d--</span>
            </div>
          )}

          {filteredEntries.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-xs italic select-none">
              Empty directory
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredEntries.map((node) => {
                const isSelected = selectedNode?.name === node.name;
                const isDir = node.type === 'dir';

                return (
                  <div
                    key={node.name}
                    onClick={() => setSelectedNode(node)}
                    onDoubleClick={() => {
                      if (isDir) {
                        const targetPath = (gameState.cwd === '/' ? '' : gameState.cwd) + '/' + node.name;
                        handleNavigate(targetPath);
                      }
                    }}
                    className={`flex items-center justify-between p-1.5 rounded text-xs font-mono transition cursor-pointer border ${
                      isSelected 
                        ? 'bg-slate-800/90 border-slate-700 text-slate-100' 
                        : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isDir ? (
                        <Folder className="w-3.5 h-3.5 text-amber-500/90 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-sky-400/90 flex-shrink-0" />
                      )}
                      <span className={`truncate select-text ${node.name.startsWith('.') ? 'text-slate-500 italic' : ''}`}>
                        {node.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 text-[11px] text-slate-500 select-none">
                      <span className="w-16 font-mono text-right">{node.permissions}</span>
                      <span className="w-14 text-right">{node.owner}</span>
                      <span className="w-12 text-right">{isDir ? '-' : `${node.size || 0}B`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Detail Sidebar */}
        {selectedNode && (
          <div className="w-60 bg-[#12161f] border-l border-[#1e2638] p-3 overflow-y-auto space-y-3 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 select-none">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Inspector
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5 select-none">Name</div>
              <div className="font-mono text-xs text-emerald-400 font-bold break-all select-text">{selectedNode.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider select-none">Type</div>
                <div className="font-mono text-slate-300 capitalize select-text">{selectedNode.type}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider select-none">Size</div>
                <div className="font-mono text-slate-300 select-text">{selectedNode.size || 0} bytes</div>
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5 select-none">Permissions</div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] select-text">
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-sky-400">
                  {selectedNode.permissions}
                </span>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-amber-400">
                  {getOctalPermissions(selectedNode.permissions)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider select-none">Owner</div>
                <div className="font-mono text-slate-300 select-text">{selectedNode.owner || 'bandit0'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider select-none">Group</div>
                <div className="font-mono text-slate-300 select-text">{selectedNode.group || 'bandit0'}</div>
              </div>
            </div>

            {selectedNode.type === 'file' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider select-none">Content</span>
                  {selectedNode.content && (
                    <button
                      onClick={() => handleCopyPreview(selectedNode.content)}
                      className="text-sky-400 hover:underline text-[10px] flex items-center gap-1 select-none"
                    >
                      {copiedPreview ? (
                        <span className="text-emerald-400">Copied</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="bg-[#0c0e14] p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
                  {selectedNode.content || '<empty file>'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
