'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setLogin } from '@/redux/slices/userSlice'; // Apni file path check kar lein
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redux mein data save karein
        dispatch(setLogin({ user: data.user, token: data.token }));
        
        setMessage("Login successful! Redirecting...");
        // Redirecting to dashboard (assume it's the next step)
        setTimeout(() => router.push('/dashboard'), 2000); 
      } else {
        setMessage(data.error || "Invalid email or password.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* LEFT SIDE: Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 p-12 flex-col justify-between text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-purple-100 text-lg">We are glad to see you again!</p>
        </div>
        
        <div className="space-y-6">
          {[
            { icon: UserCheck, title: "Seamless Access", desc: "Quickly log in to your dashboard." },
            { icon: Sparkles, title: "Stay Updated", desc: "Track your progress and new skills." },
            { icon: CheckCircle2, title: "Secure Session", desc: "Your data is protected and encrypted." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <item.icon className="text-purple-300 w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-purple-200 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-purple-300">© 2026 SkillSwap AI.</p>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-purple-100 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
            {message && (
              <p className={`text-sm mt-4 font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input name="email" onChange={handleChange} required type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="name@example.com" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="#" className="text-xs text-purple-600 font-semibold hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input name="password" onChange={handleChange} required type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
              <label className="text-sm text-slate-600">Remember me</label>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition transform hover:scale-[1.01] shadow-lg shadow-purple-200">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span>or continue with</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Google', 'GitHub', 'Apple'].map((provider) => (
              <button key={provider} type="button" className="py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-600">
                {provider}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-slate-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}