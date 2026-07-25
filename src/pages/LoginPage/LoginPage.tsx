import { useState } from 'react';
import { Mail, Lock, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { loginApi } from '../../api/authApi'; 
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { setCredentials } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/hooks';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState(''); 

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const dispatch = useAppDispatch();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (serverError) setServerError('');
    
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempErrors: Record<string, string> = {};
    if (!formData.email) tempErrors.email = "البريد الإلكتروني مطلوب.";
    if (!formData.password) tempErrors.password = "كلمة المرور مطلوبة.";
    
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setServerError('');

    try {
      const data = (await loginApi(formData)) as { token?: string; value?: { token?: string } };
      const token = data.token || data.value?.token;
      
      if (token) {
        localStorage.setItem('token', token);

        // ================= فك التوكن وتوجيه اليوزر ================= //
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);

          let roleClaim: string | string[] | null = null;
          for (const key in decoded) {
            if (key.toLowerCase().includes("role")) {
              roleClaim = decoded[key];
              break;
            }
          }

          if (roleClaim) {
            const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            const normalizedRoles = roles.map(r => String(r).toLowerCase().trim());
            
            // 1. نجهز متغير نوعه مطابق بالظبط للنوع اللي في الريدكس
            let finalRole: 'doctor' | 'parent' | 'admin' | null = null;
            
            if (normalizedRoles.includes("admin") || normalizedRoles.includes("2")) {
              finalRole = 'admin';
            } else if (normalizedRoles.includes("doctor") || normalizedRoles.includes("0")) {
              finalRole = 'doctor';
            } else if (normalizedRoles.includes("parent") || normalizedRoles.includes("1")) {
              finalRole = 'parent';
            }

            // 2. نعمل dispatch للرول النهائي المطابق للشروط
            dispatch(setCredentials({ token, role: finalRole }));
            
            // 3. التوجيه بناءً على الرول
            if (finalRole === 'admin') {
              navigate('/admin');
              return; 
            }
            if (finalRole === 'doctor') {
              navigate('/doctor/children');
              return;
            }
            if (finalRole === 'parent') {
              navigate('/parent/children'); 
              return;
            }
          }
        } catch (decodeError) {
          console.error("Error decoding token on login:", decodeError);
        }
        // ==================================================================== //
      }
      
      // التوجيه الافتراضي لو حصل أي مشكلة في فك التوكن بس في توكن موجود
      if (token) {
          // نحدث الريدكس بالتوكن على الأقل حتى لو مفيش رول واضح
          dispatch(setCredentials({ token, role: null }));
      }
      navigate('/doctor/children'); 
      
    } catch (err: unknown) {
      const apiError = err as { response?: { status?: number; data?: { message?: string; title?: string; detail?: string } } };
      console.error("Login Error Response:", apiError.response?.data); 

      const status = apiError.response?.status;
      const responseData = apiError.response?.data;
      const errorString = JSON.stringify(responseData || "").toLowerCase();

      if (status === 401) {
        if (errorString.includes('confirm') || errorString.includes('تأكيد')) {
          setErrors({ email: 'يرجى تأكيد بريدك الإلكتروني أولاً.' });
        } 
        else {
          setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          setErrors({ email: ' ', password: ' ' });
        }
      } else if (status === 404) {
        setErrors({ email: 'هذا الحساب غير مسجل لدينا.' });
      } else {
        const genericMessage = responseData?.message || responseData?.title || responseData?.detail || 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً.';
        setServerError(genericMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`bg-white ${styles.cardShadow}`}>
        
        <h2 className={`${styles.title} mb-2`}>أهلاً بعودتك!</h2>
        <p className={`${styles.subtitle} mb-8`}>سجل الدخول لمتابعة تقدمك.</p>

        {serverError && (
          <div className="mb-4 text-red-600 text-base font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          
          <div className="flex flex-col gap-1">
            <label className="text-sm md:text-base font-extrabold text-[#581C87] tracking-widest uppercase">البريد الإلكتروني</label>
            <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer} ${errors.email ? 'border-red-500' : ''}`}>
              <Mail className="w-5 h-5 text-[#581C87] flex-shrink-0" />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="أدخل بريدك الإلكتروني" 
                autoComplete="off" 
                className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
              />
            </div>
            {errors.email && errors.email.trim() !== '' && (
              <span className="text-red-500 text-sm font-bold">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-sm md:text-base font-extrabold text-[#581C87] tracking-widest uppercase">كلمة المرور</label>
              <a href="/forgot-password" className="text-sm md:text-base font-extrabold text-[#581C87] hover:underline">نسيت كلمة المرور؟</a>
            </div>
            <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer} ${errors.password ? 'border-red-500' : ''}`}>
              <Lock className="w-5 h-5 text-[#581C87] flex-shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                autoComplete="new-password" 
                className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-300 placeholder:text-sm placeholder:md:text-base tracking-widest mr-2 min-w-0" 
              />
              <Eye 
                className="w-5 h-5 text-[#581C87] cursor-pointer flex-shrink-0" 
                onClick={() => setShowPassword(!showPassword)} 
              />
            </div>
            {errors.password && errors.password.trim() !== '' && (
              <span className="text-red-500 text-sm font-bold leading-relaxed">{errors.password}</span>
            )}
          </div>

          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}
          >
            {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            {!isLoading && <ArrowLeft className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-gray-500">
          ليس لديك حساب؟ <a href="/signup" className="text-[#581C87] hover:underline mr-1">أنشئ حسابًا مجانًا</a>
        </div>
      </div>
    </AuthLayout>
  );
}