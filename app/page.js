'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const json = await res.json();
    if (json.success) setTasks(json.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority })
    });
    
    if (res.ok) {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      fetchTasks();
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 text-slate-100 font-sans">
      
      {/* Premium Header */}
      <header className="max-w-6xl mx-auto text-center my-10 space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
          Vibe Task Manager
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">
          An AI-First Kanban Workspace for High-Velocity Builders
        </p>
      </header>
      
      {/* Glassmorphic Form Container */}
      <section className="max-w-xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl mb-14 transition-all duration-300 hover:border-indigo-500/30">
        <h2 className="text-xl font-bold mb-5 tracking-wide text-indigo-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Deploy New Task
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="What needs to be built?" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 transition" 
            required
          />
          <textarea 
            placeholder="Add some engineering details or context..." 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            rows="3"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 transition resize-none"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full">
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300 cursor-pointer transition"
              >
                <option value="Low" className="bg-slate-900">Low Priority</option>
                <option value="Medium" className="bg-slate-900">Medium Priority</option>
                <option value="High" className="bg-slate-900">High Priority</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center min-h-[46px]"
            >
              {loading ? 'Adding...' : 'Add Task +'}
            </button>
          </div>
        </form>
      </section>

      {/* Kanban Board Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
        {['Todo', 'Progress', 'Done'].map((colStatus) => {
          const colTasks = tasks.filter(t => t.status === colStatus);
          
          // Custom Column Header Colors
          const headerColors = {
            Todo: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
            Progress: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
            Done: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
          };

          return (
            <div key={colStatus} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 min-h-[450px] shadow-xl backdrop-blur-sm flex flex-col">
              <div className={`flex justify-between items-center px-3 py-2 rounded-xl border ${headerColors[colStatus]} mb-5`}>
                <h3 className="font-bold tracking-wider text-sm uppercase">
                  {colStatus === 'Progress' ? 'In Progress' : colStatus}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/5">
                  {colTasks.length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto flex-1 max-h-[500px] pr-1 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <p className="text-slate-600 text-xs text-center py-10 italic">No tasks here</p>
                ) : (
                  colTasks.map(task => {
                    // Priority Badge Colors
                    const priorityStyles = {
                      High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    };

                    return (
                      <div 
                        key={task._id} 
                        className="group bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-bold text-slate-200 text-base break-words tracking-wide group-hover:text-white transition">
                              {task.title}
                            </h4>
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold border ${priorityStyles[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-slate-400 text-xs mb-4 leading-relaxed break-words font-light">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Interactive Actions Panel */}
                        <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 text-[11px] font-medium">
                          <button 
                            onClick={() => deleteTask(task._id)} 
                            className="text-slate-500 hover:text-rose-400 transition font-semibold tracking-wide"
                          >
                            Delete
                          </button>
                          
                          <div className="flex gap-2">
                            {colStatus !== 'Todo' && (
                              <button 
                                onClick={() => updateStatus(task._id, colStatus === 'Done' ? 'Progress' : 'Todo')} 
                                className="text-slate-400 hover:text-slate-200 flex items-center transition bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50"
                              >
                                ◀ Back
                              </button>
                            )}
                            {colStatus !== 'Done' && (
                              <button 
                                onClick={() => updateStatus(task._id, colStatus === 'Todo' ? 'Progress' : 'Done')} 
                                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center transition bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-900/50"
                              >
                                Next ▶
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}