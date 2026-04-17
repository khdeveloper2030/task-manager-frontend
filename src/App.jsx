import { useState, useEffect } from "react";
import { 
  LayoutDashboard, CheckCircle2, Clock, AlertCircle, 
  Plus, Trash2, Calendar, X, Sparkles, Edit3, Save, ArrowRight, Menu
} from "lucide-react";

// ប្តូរ URL នេះទៅតាម URL របស់ Backend លើ Vercel
const API_URL = "https://taskly-api.vercel.app/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: "", description: "", priority: "មធ្យម", status: "todo", startDate: "", endDate: "" 
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = editingId !== null;
    const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setEditingId(null);
    setFormData({ title: "", description: "", priority: "មធ្យម", status: "todo", startDate: "", endDate: "" });
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({ 
      title: task.title, description: task.description, priority: task.priority, status: task.status, 
      startDate: task.startDate ? task.startDate.slice(0, 16) : "",
      endDate: task.endDate ? task.endDate.slice(0, 16) : "" 
    });
    setShowModal(true);
  };

  const deleteTask = async (id) => {
    if (window.confirm("តើអ្នកប្រាកដថាចង់លុប?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchTasks();
    }
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed').length,
    prog: tasks.filter(t => t.status === 'todo').length,
    rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 flex font-sans overflow-x-hidden">
      
      {/* Sidebar Responsive */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-[#0a0f1d]/95 backdrop-blur-xl p-6 flex flex-col z-50 transition-transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10 text-blue-500">
          <div className="flex items-center gap-2 font-black italic tracking-tighter uppercase"><Sparkles fill="currentColor"/> Taskly</div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X/></button>
        </div>
        <nav className="space-y-2 flex-1">
          <NavBtn active={filter==='all'} onClick={()=>{setFilter('all'); setIsSidebarOpen(false)}} icon={<LayoutDashboard size={20}/>} label="ផ្ទាំងគ្រប់គ្រង" />
          <NavBtn active={filter==='progressing'} onClick={()=>{setFilter('progressing'); setIsSidebarOpen(false)}} icon={<Clock size={20}/>} label="កំពុងអនុវត្ត" />
          <NavBtn active={filter==='completed'} onClick={()=>{setFilter('completed'); setIsSidebarOpen(false)}} icon={<CheckCircle2 size={20}/>} label="បានបញ្ចប់" />
        </nav>
        <div className="border-t border-white/5 pt-4 text-[10px] text-center italic text-slate-600">© ២០២៦ Seyha EM</div>
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white/5 rounded-xl"><Menu/></button>
            <h2 className="text-2xl md:text-3xl font-black">{filter==='all'?"OVERVIEW":filter.toUpperCase()}</h2>
          </div>
          <button onClick={() => {setEditingId(null); setShowModal(true);}} className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all shadow-xl"><Plus/> ថ្មី</button>
        </header>

        {filter === 'all' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-around gap-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * stats.rate) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000" /></svg>
                <span className="absolute text-4xl font-black">{stats.rate}%</span>
              </div>
              <div className="text-center md:text-left border-l-4 border-blue-500 pl-8">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">ភារកិច្ចសរុប</p>
                <h4 className="text-6xl font-black italic">{stats.total}</h4>
              </div>
            </div>
            <div className="flex flex-col gap-4">
               <StatusCard label="កំពុងអនុវត្ត" count={stats.prog} color="blue" icon={<Clock/>}/>
               <StatusCard label="បានបញ្ចប់" count={stats.done} color="emerald" icon={<CheckCircle2/>}/>
            </div>
          </section>
        )}

        {filter !== 'all' && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.filter(t => (filter==='completed' ? t.status==='completed' : t.status==='todo')).map(task => (
              <div key={task.id} className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] relative transition-all hover:bg-white/[0.08]">
                <div className={`absolute top-0 left-0 w-2 h-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-white/10">{task.priority}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(task)} className="p-2 text-slate-500 hover:text-blue-400"><Edit3 size={18}/></button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-4 ${task.status === 'completed' ? 'line-through text-slate-600' : ''}`}>{task.title}</h3>
                <div className="space-y-1 text-[10px] font-bold text-slate-500 font-sans border-t border-white/5 pt-4">
                  <div>START: {task.startDate ? new Date(task.startDate).toLocaleString('km-KH') : 'N/A'}</div>
                  <div>END: {task.endDate ? new Date(task.endDate).toLocaleString('km-KH') : 'N/A'}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#161b2c] w-full max-w-lg p-8 rounded-[3rem] relative shadow-2xl">
              <button onClick={() => {setShowModal(false); setEditingId(null);}} className="absolute top-6 right-6 text-slate-500"><X/></button>
              <h3 className="text-2xl font-black mb-6">{editingId ? "Update Task" : "New Task"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title..." required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder="Description..." className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl h-24 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                  <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}><option value="todo">Progressing</option><option value="completed">Completed</option></select>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-slate-500 uppercase">
                  <div><label>Start</label><input type="datetime-local" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></div>
                  <div><label>End</label><input type="datetime-local" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} /></div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all"><Save size={20} className="inline mr-2"/> {editingId ? "យល់ព្រមកែប្រែ" : "រក្សាទុក"}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>{icon} {label}</button>
  );
}

function StatusCard({ label, count, color, icon }) {
  const c = color === 'blue' ? 'border-blue-500/20 text-blue-400' : 'border-emerald-500/20 text-emerald-400';
  return (
    <div className={`bg-white/5 border ${c} p-6 rounded-[2rem] flex items-center justify-between`}>
      <div><p className="text-[10px] font-black uppercase">{label}</p><h4 className="text-4xl font-black italic">{count}</h4></div>
      <div className="opacity-30">{icon}</div>
    </div>
  );
}

export default App;