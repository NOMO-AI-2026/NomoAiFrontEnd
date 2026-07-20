import { useState } from 'react';
import { Mail, Lock, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { loginApi } from '../../api/authApi'; 
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    // مسح خطأ السيرفر لو المستخدم بدأ يعدل البيانات
    if (serverError) setServerError('');
    if (Object.keys(errors).length > 0) setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let tempErrors: Record<string, string> = {};
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
      const response = await loginApi(formData);
      navigate('/'); 
    } catch (err: any) {
      console.error("Login Error Response:", err.response?.data); 

      const status = err.response?.status;
      const responseData = err.response?.data;
      const errorString = JSON.stringify(responseData || "").toLowerCase();

      if (status === 401) {
        // لو الباك إند موضح إن المشكلة في التأكيد
        if (errorString.includes('confirm') || errorString.includes('تأكيد')) {
          setErrors({ email: 'يرجى تأكيد بريدك الإلكتروني أولاً.' });
        } 
        // الرد الأمني الموحد (البريد أو كلمة المرور غير صحيحة)
        else {
          setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          // هنبعت مسافة فاضية عشان الحقول تنور أحمر بس من غير نص تحتها
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
      <div className={`bg-white p-8 lg:p-10 ${styles.cardShadow}`}>
        <h2 className="text-3xl font-extrabold text-[#581C87] mb-2">أهلاً بعودتك!</h2>
        <p className="text-sm font-bold text-gray-600 mb-8">سجل الدخول لمتابعة تقدمك.</p>

        {serverError && (
          <div className="mb-4 text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">البريد الإلكتروني</label>
            <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer} ${errors.email ? 'border-red-500' : ''}`}>
              <Mail className="w-5 h-5 text-[#581C87] flex-shrink-0" />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="أدخل بريدك الإلكتروني" 
                autoComplete="off" 
                className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" 
              />
            </div>
            {/* ضفنا شرط إن الخطأ ميكونش مسافة فاضية عشان مياخدش مساحة على الفاضي */}
            {errors.email && errors.email.trim() !== '' && (
              <span className="text-red-500 text-xs font-bold">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">كلمة المرور</label>
              <a href="#" className="text-[11px] font-extrabold text-[#581C87] hover:underline">نسيت كلمة المرور؟</a>
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
                className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-300 tracking-widest mr-2 min-w-0" 
              />
              <Eye 
                className="w-5 h-5 text-[#581C87] cursor-pointer flex-shrink-0" 
                onClick={() => setShowPassword(!showPassword)} 
              />
            </div>
            {errors.password && errors.password.trim() !== '' && (
              <span className="text-red-500 text-xs font-bold leading-relaxed">{errors.password}</span>
            )}
          </div>

          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold text-[15px] py-3.5 rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}
          >
            {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            {!isLoading && <ArrowLeft className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-500">
          ليس لديك حساب؟ <a href="/signup" className="text-[#581C87] hover:underline mr-1">أنشئ حسابًا مجانًا</a>
        </div>
      </div>
    </AuthLayout>
  );
}