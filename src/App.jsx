import { useState, useEffect } from "react";
import { 
  LayoutDashboard, CheckCircle2, Clock, AlertCircle, 
  Plus, Trash2, Calendar, X, Sparkles, Edit3, Save, ArrowRight, Menu
} from "lucide-react";

// បញ្ជាក់៖ ប្រើ API_URL ឱ្យត្រូវជាមួយការកំណត់ក្នុង Vercel Environment Variables
const BASE_URL = import.meta.env.VITE_API_URL || "https://task-manager-backend-red-nine.vercel.app/api";
const API_URL = BASE_URL.endsWith('/tasks') ? BASE_URL : `${BASE_URL}/tasks`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: "", description: "", priority: "medium", status: "todo", startDate: "", endDate: "" 
  });

  // ១. មុខងារទាញយកទិន្នន័យ
  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
      setTasks([]); 
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // ២. មុខងារបន្ថែម ឬ កែប្រែទិន្នន័យ
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = editingId !== null;
    const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: "", description: "", priority: "medium", status: "todo", startDate: "", endDate: "" });
        fetchTasks();
      } else {
        const errorMsg = await response.json();
        alert("កំហុស៖ " + (errorMsg.error || "មិនអាចរក្សាទុកបាន"));
      }
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({ 
      title: task.title, 
      description: task.description || "", 
      priority: task.priority || "medium", 
      status: task.status || "todo", 
      startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 16) : "",
      endDate: task.endDate ? new Date(task.endDate).toISOString().slice(0, 16) : "" 
    });
    setShowModal(true);
  };

  const deleteTask = async (id) => {
    if (window.confirm("តើអ្នកប្រាកដថាចង់លុបភារកិច្ចនេះ?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) fetchTasks();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  // ៣. ការគណនាស្ថិតិ
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed').length,
    prog: tasks.filter(t => t.status === 'todo').length,
    rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 flex font-sans overflow-x-hidden">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-[#0a0f1d]/95 backdrop-blur-xl p-6 flex flex-col z-50 transition-transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10 text-blue-500">
          <div className="flex items-center gap-2 font-black italic tracking-tighter uppercase text-xl">
            <Sparkles fill="currentColor" className="text-blue-500"/> Taskly
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400"><X/></button>
        </div>
        <nav className="space-y-2 flex-1">
          <NavBtn active={filter==='all'} onClick={()=>{setFilter('all'); setIsSidebarOpen(false)}} icon={<LayoutDashboard size={20}/>} label="ផ្ទាំងគ្រប់គ្រង" />
          <NavBtn active={filter==='progressing'} onClick={()=>{setFilter('progressing'); setIsSidebarOpen(false)}} icon={<Clock size={20}/>} label="កំពុងអនុវត្ត" />
          <NavBtn active={filter==='completed'} onClick={()=>{setFilter('completed'); setIsSidebarOpen(false)}} icon={<CheckCircle2 size={20}/>} label="បានបញ្ចប់" />
        </nav>
        <div className="border-t border-white/5 pt-4 text-[10px] text-center italic text-slate-600">© ២០២៦ Seyha EM</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white/5 rounded-xl"><Menu/></button>
            <h2 className="text-2xl md:text-3xl font-black tracking-widest">{filter==='all'?"OVERVIEW":filter.toUpperCase()}</h2>
          </div>
          <button onClick={() => {setEditingId(null); setFormData({title:"", description:"", priority:"medium", status:"todo", startDate:"", endDate:""}); setShowModal(true);}} 
            className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-900/20">
            <Plus size={20}/> ថ្មី
          </button>
        </header>

        {filter === 'all' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-around gap-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * stats.rate) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000" />
                </svg>
                <span className="absolute text-4xl font-black">{stats.rate}%</span>
              </div>
              <div className="text-center md:text-left border-l-4 border-blue-500 pl-8">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-widest">ភារកិច្ចសរុប</p>
                <h4 className="text-6xl font-black italic tracking-tighter">{stats.total}</h4>
              </div>
            </div>
            <div className="flex flex-col gap-4">
                <StatusCard label="កំពុងអនុវត្ត" count={stats.prog} color="blue" icon={<Clock/>}/>
                <StatusCard label="បានបញ្ចប់" count={stats.done} color="emerald" icon={<CheckCircle2/>}/>
            </div>
          </section>
        )}

        {/* Task Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks
            .filter(t => {
              if (filter === 'completed') return t.status === 'completed';
              if (filter === 'progressing') return t.status === 'todo';
              return true;
            })
            .map(task => (
              <div key={task.id} className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] relative transition-all hover:bg-white/[0.08] hover:border-white/20">
                <div className={`absolute top-0 left-0 w-2 h-full rounded-l-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                <div className="flex justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${task.priority === 'high' ? 'border-red-500/50 text-red-400' : 'border-white/10 text-slate-400'}`}>{task.priority}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(task)} className="p-2 text-slate-500 hover:text-blue-400"><Edit3 size={18}/></button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-4 leading-tight ${task.status === 'completed' ? 'line-through text-slate-600' : 'text-slate-100'}`}>{task.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{task.description}</p>
                <div className="space-y-1 text-[10px] font-bold text-slate-500 font-sans border-t border-white/5 pt-4">
                  <div className="flex justify-between"><span>ចាប់ផ្ដើម:</span> <span>{task.startDate ? new Date(task.startDate).toLocaleString('km-KH') : '---'}</span></div>
                  <div className="flex justify-between"><span>បញ្ចប់:</span> <span>{task.endDate ? new Date(task.endDate).toLocaleString('km-KH') : '---'}</span></div>
                </div>
              </div>
            ))}
        </section>

        {/* Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#161b2c] w-full max-w-lg p-8 rounded-[3rem] relative shadow-2xl border border-white/10">
              <button onClick={() => {setShowModal(false); setEditingId(null);}} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X/></button>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                {editingId ? <Edit3 className="text-blue-500"/> : <Plus className="text-blue-500"/>}
                {editingId ? "កែប្រែភារកិច្ច" : "បន្ថែមភារកិច្ចថ្មី"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="ចំណងជើង..." required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-colors" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder="ការពិពណ៌នា..." className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl h-24 outline-none focus:border-blue-500 transition-colors" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">កម្រិតអាទិភាព</label>
                    <select className="w-full p-4 bg-[#0a0f1d] border border-white/10 rounded-2xl outline-none" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">ទាប (Low)</option>
                      <option value="medium">មធ្យម (Medium)</option>
                      <option value="high">ខ្ពស់ (High)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">ស្ថានភាព</label>
                    <select className="w-full p-4 bg-[#0a0f1d] border border-white/10 rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="todo">កំពុងអនុវត្ត</option>
                      <option value="completed">បានបញ្ចប់</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-slate-500 uppercase">
                  <div><label className="ml-2">ថ្ងៃចាប់ផ្ដើម</label><input type="datetime-local" className="w-full p-3 mt-1 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></div>
                  <div><label className="ml-2">ថ្ងៃបញ្ចប់</label><input type="datetime-local" className="w-full p-3 mt-1 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} /></div>
                </div>
                <button type="submit" className="w-full py-5 mt-4 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/40">
                  <Save size={20}/> {editingId ? "យល់ព្រមកែប្រែ" : "រក្សាទុកភារកិច្ច"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>{icon} {label}</button>
  );
}

function StatusCard({ label, count, color, icon }) {
  const c = color === 'blue' ? 'border-blue-500/20 text-blue-400' : 'border-emerald-500/20 text-emerald-400';
  const iconC = color === 'blue' ? 'text-blue-500' : 'text-emerald-500';
  return (
    <div className={`bg-white/5 border ${c} p-6 rounded-[2rem] flex items-center justify-between hover:bg-white/[0.07] transition-colors`}>
      <div><p className="text-[10px] font-black uppercase tracking-widest mb-1">{label}</p><h4 className="text-4xl font-black italic tracking-tighter">{count}</h4></div>
      <div className={`${iconC} opacity-40`}>{icon}</div>
    </div>
  );
}

export default App;