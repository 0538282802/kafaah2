
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, MaintenanceRequest, RequestStatus, PaymentStatus } from './types';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import CustomerDashboard from './components/CustomerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('kafaa_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedUser = localStorage.getItem('kafaa_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedRequests = localStorage.getItem('kafaa_requests');
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kafaa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kafaa_theme', 'light');
    }
  };

  const handleLoginSuccess = (id: string) => {
    const role = id === 'admin1234' ? UserRole.ADMIN : id.startsWith('tec') ? UserRole.TECHNICIAN : UserRole.CUSTOMER;
    
    if (role === UserRole.CUSTOMER) {
      const savedCustomers = JSON.parse(localStorage.getItem('kafaa_customers') || '[]');
      const existingCustomer = savedCustomers.find((c: any) => c.phoneOrCode === id);
      
      if (existingCustomer) {
        setUser(existingCustomer);
        localStorage.setItem('kafaa_user', JSON.stringify(existingCustomer));
      } else {
        setNeedsOnboarding(true);
        const tempUser = { id, role, name: '', phoneOrCode: id };
        setUser(tempUser);
      }
    } else {
      const u = { id, role, name: role === UserRole.ADMIN ? 'المدير' : 'فني كفاءة', phoneOrCode: id };
      setUser(u);
      localStorage.setItem('kafaa_user', JSON.stringify(u));
    }
  };

  const handleOnboardingComplete = (name: string, location: { lat: number, lng: number, address: string }) => {
    if (!user) return;
    const fullProfile: UserProfile = { ...user, name, location };
    const savedCustomers = JSON.parse(localStorage.getItem('kafaa_customers') || '[]');
    localStorage.setItem('kafaa_customers', JSON.stringify([...savedCustomers, fullProfile]));
    setUser(fullProfile);
    localStorage.setItem('kafaa_user', JSON.stringify(fullProfile));
    setNeedsOnboarding(false);
  };

  const updateRequest = (updatedReq: MaintenanceRequest) => {
    const updated = requests.map(r => r.id === updatedReq.id ? updatedReq : r);
    setRequests(updated);
    localStorage.setItem('kafaa_requests', JSON.stringify(updated));
  };

  const updatePaymentStatus = (id: string, paymentStatus: PaymentStatus, method?: string) => {
    // حساب تاريخ الضمان (3 أشهر من اليوم)
    const today = new Date();
    today.setMonth(today.getMonth() + 3);
    const warrantyDate = today.toLocaleDateString('ar-SA');

    const updated = requests.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          paymentStatus, 
          paymentMethod: method || r.paymentMethod || 'CASH',
          status: paymentStatus === PaymentStatus.PAID ? RequestStatus.COMPLETED : r.status,
          warrantyExpiryDate: paymentStatus === PaymentStatus.PAID ? warrantyDate : r.warrantyExpiryDate
        };
      }
      return r;
    });
    
    setRequests(updated);
    localStorage.setItem('kafaa_requests', JSON.stringify(updated));
  };

  const logout = () => { 
    setUser(null); 
    setNeedsOnboarding(false);
    localStorage.removeItem('kafaa_user'); 
  };

  if (!user) return <Login onLogin={handleLoginSuccess} />;
  if (needsOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="min-h-screen bg-kafaa-light transition-colors duration-300">
      <header className="bg-white/95 dark:bg-slate-900/95 sticky top-0 z-[60] px-6 py-4 flex justify-between items-center border-b border-kafaa-green/10 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 kafaa-gradient rounded-xl flex items-center justify-center text-white shadow-lg">⚡</div>
           <div className="flex flex-col">
              <span className="text-lg font-black text-kafaa-dark">كفاءة <span className="text-kafaa-green">بلس</span></span>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-kafaa-dark transition-all active:scale-90">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} className="text-slate-400 font-bold text-xs hover:text-rose-500 transition-colors">خروج</button>
        </div>
      </header>

      <main className={`mx-auto p-4 max-w-md ${user.role === UserRole.ADMIN ? 'max-w-4xl' : ''}`}>
        {user.role === UserRole.CUSTOMER && <CustomerDashboard requests={requests} onAddRequest={(r) => { const newReqs = [r, ...requests]; setRequests(newReqs); localStorage.setItem('kafaa_requests', JSON.stringify(newReqs)); }} onPay={updatePaymentStatus} onUpdateRequest={updateRequest} />}
        {user.role === UserRole.TECHNICIAN && <TechnicianDashboard requests={requests} onUpdateStatus={(id, s) => updateRequest({...requests.find(r=>r.id===id)!, status: s})} onUpdatePayment={updatePaymentStatus} onUpdateRequest={(r) => {
          if (r.status === RequestStatus.COMPLETED && r.paymentStatus === PaymentStatus.PAID) {
             updatePaymentStatus(r.id, PaymentStatus.PAID);
          } else {
             updateRequest(r);
          }
        }} />}
        {user.role === UserRole.ADMIN && <AdminDashboard requests={requests} onUpdateRequest={updateRequest} onAddRequest={()=>{}} />}
        {user.role === UserRole.SUPERVISOR && <SupervisorDashboard requests={requests} onUpdateStatus={()=>{}} onUpdateRequest={updateRequest} />}
      </main>
    </div>
  );
};

export default App;
