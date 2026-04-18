import { useState, useEffect } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { 
  LayoutDashboard, CheckCircle2, Clock, Plus, Trash2, X, Sparkles, Edit3, Save, Menu, LogOut 
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "https://task-manager-backend-red-nine.vercel.app/api";
const API_URL = BASE_URL.endsWith('/tasks') ? BASE_URL : `${BASE_URL}/tasks`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: "", description: "", priority: "medium", status: "todo", startDate: "", endDate: "" 
  });

  // ១. គ្រប់គ្រង SplashScreen និងពិនិត្យស្ថានភាព Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    });
    return () => unsubscribe();
  }, []);

  // ២. ទាញយកទិន្នន័យ (ភ្ជាប់ជាមួយ Email ដើម្បីការពារ Error 400 និងបែងចែក User)
  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}?email=${user.email}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
      setTasks([]); 
    }
  };

  useEffect(() => { if (user) fetchTasks(); }, [user]);

  // ៣. មុខងារ Login / Logout
  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  // ៤. មុខងារ Submit (Add/Edit) - បញ្ជូន Payload ពេញលេញទៅ Backend
 const handleSubmit = async (e) => {
    e.preventDefault();
    
    // បន្ថែមការការពារ៖ បើមិនទាន់ Login មិនឱ្យផ្ញើទៅ Backend នាំតែ Error 400
    if (!user || !user.email) {
      alert("សូម Login ជាមុនសិន!");
      return;
    }

    const isEdit = editingId !== null;
    const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    // បង្កើត Payload ដោយធានាថាគ្រប់ Column ទាំងអស់មានទិន្នន័យត្រឹមត្រូវ
    const payload = { 
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      // ប្រសិនបើ Date ទទេ ត្រូវផ្ញើ null កុំផ្ញើអក្សរទទេ "" ដើម្បីកុំឱ្យ Postgres លោត Error
      startDate: formData.startDate || null, 
      endDate: formData.endDate || null,
      userEmail: user.email 
    }; 

    console.log("🚀 ផ្ញើទៅកាន់ Server:", payload);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: "", description: "", priority: "medium", status: "todo", startDate: "", endDate: "" });
        fetchTasks();
      } else {
        const errorData = await response.json();
        console.error("❌ Server Error 400:", errorData);
        // បង្ហាញ Error ពិតប្រាកដពី Backend ដើម្បីឱ្យយើងងាយស្រួលដោះស្រាយ
        alert("កំហុស៖ " + (errorData.error || "ទិន្នន័យមិនត្រឹមត្រូវ"));
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
    }
  };
  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({ 
      title: task.title, 
      description: task.description || "", 
      priority: task.priority || "medium", 
      status: task.status || "todo", 
      // រក្សាទម្រង់កាលបរិច្ឆេទឱ្យត្រូវជាមួយ Input
      startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 16) : "",
      endDate: task.endDate ? new Date(task.endDate).toISOString().slice(0, 16) : "" 
    });
    setShowModal(true);
  };

  const deleteTask = async (id) => {
    if (window.confirm("តើអ្នកប្រាកដថាចង់លុប?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) fetchTasks();
      } catch (err) { console.error(err); }
    }
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed').length,
    prog: tasks.filter(t => t.status === 'todo').length,
    rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0f1d] flex flex-col items-center justify-center">
        <div className="relative animate-bounce">
           <Sparkles size={80} className="text-blue-500" fill="currentColor"/>
           <div className="absolute inset-0 blur-2xl bg-blue-500/20"></div>
        </div>
        <h1 className="text-4xl font-black italic text-white mt-4 tracking-tighter">TASKLY</h1>
        <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Organizing your life...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#0a0f1d] flex items-center justify-center p-6 text-center">
        <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] max-w-md w-full shadow-2xl">
          <Sparkles size={60} className="text-blue-500 mx-auto mb-8" fill="currentColor"/>
          <h2 className="text-3xl font-black mb-4 text-white italic">Welcome Back</h2>
          <p className="text-slate-400 mb-10 text-sm">Sign in with Google to access your tasks.</p>
          <button onClick={handleLogin} className="w-full py-5 bg-white text-black rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /> Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 flex font-sans overflow-x-hidden">
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
        <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-2xl">
                <img src={user.photoURL} className="w-10 h-10 rounded-full border border-blue-500 p-0.5"/>
                <div className="overflow-hidden"><p className="text-xs font-bold truncate">{user.displayName}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"><LogOut size={18}/> ចាកចេញ</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white/5 rounded-xl"><Menu/></button>
            <h2 className="text-2xl md:text-3xl font-black tracking-widest">{filter==='all'?"OVERVIEW":filter.toUpperCase()}</h2>
          </div>
          <button onClick={() => {setEditingId(null); setFormData({title:"", description:"", priority:"medium", status:"todo", startDate:"", endDate:""}); setShowModal(true);}} 
            className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
            <Plus size={20}/> ថ្មី
          </button>
        </header>

        {filter === 'all' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-around gap-10">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="104" cy="104" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                  <circle cx="104" cy="104" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="565" strokeDashoffset={565 - (565 * stats.rate) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000" />
                </svg>
                <span className="absolute text-5xl font-black italic">{stats.rate}%</span>
              </div>
              <div className="text-center md:text-left border-l-4 border-blue-500 pl-10">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1 opacity-50 tracking-widest">ភារកិច្ចសរុប</p>
                <h4 className="text-7xl font-black italic tracking-tighter">{stats.total}</h4>
              </div>
            </div>
            <div className="flex flex-col gap-6">
                <StatusCard label="កំពុងអនុវត្ត" count={stats.prog} color="blue" icon={<Clock size={32}/>}/>
                <StatusCard label="បានបញ្ចប់" count={stats.done} color="emerald" icon={<CheckCircle2 size={32}/>}/>
            </div>
          </section>
        )}

        {filter !== 'all' && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {tasks
              .filter(t => (filter === 'completed' ? t.status === 'completed' : t.status === 'todo'))
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
                  <h3 className={`text-xl font-bold mb-2 leading-tight ${task.status === 'completed' ? 'line-through text-slate-600' : 'text-slate-100'}`}>{task.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{task.description}</p>
                  <div className="text-[10px] text-slate-600 font-bold border-t border-white/5 pt-3">
                    {task.startDate && <div>Start: {new Date(task.startDate).toLocaleString()}</div>}
                  </div>
                </div>
              ))}
              {tasks.filter(t => (filter === 'completed' ? t.status === 'completed' : t.status === 'todo')).length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-600 italic">មិនមានភារកិច្ចក្នុងបញ្ជីនេះទេ...</div>
              )}
          </section>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#161b2c] w-full max-w-lg p-8 rounded-[3rem] relative shadow-2xl border border-white/10 animate-in zoom-in duration-300">
              <button onClick={() => {setShowModal(false); setEditingId(null);}} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
              <h3 className="text-2xl font-black mb-6 italic">{editingId ? "Edit Task" : "New Task"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="ចំណងជើង..." required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder="ការពិពណ៌នា..." className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl h-24 outline-none focus:border-blue-500 transition-all" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-[#0a0f1d] border border-white/10 rounded-2xl outline-none" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                  <select className="w-full p-4 bg-[#0a0f1d] border border-white/10 rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="todo">កំពុងអនុវត្ត</option><option value="completed">បានបញ្ចប់</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 ml-2 uppercase font-bold">Start Date</label>
                    <input type="datetime-local" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none text-xs" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 ml-2 uppercase font-bold">End Date</label>
                    <input type="datetime-local" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none text-xs" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 shadow-xl transition-all">
                  <Save size={20}/> {editingId ? "Update Now" : "Save Task"}
                </button>
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>{icon} {label}</button>
  );
}

function StatusCard({ label, count, color, icon }) {
  const c = color === 'blue' ? 'border-blue-500/20 text-blue-400' : 'border-emerald-500/20 text-emerald-400';
  return (
    <div className={`bg-white/5 border ${c} p-8 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.07] transition-all`}>
      <div><p className="text-[10px] font-black uppercase mb-1">{label}</p><h4 className="text-4xl font-black italic">{count}</h4></div>
      <div className="opacity-30 scale-125">{icon}</div>
    </div>
  );
}

export default App;