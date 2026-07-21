import { useState } from 'react';
import { Mail, Lock, Eye, ArrowLeft, User, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { registerApi } from '../../api/authApi'; 
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { validateSignup } from '../../utils/validations'; 

interface ApiError {
  response?: {
    status?: number;
    data?: {
      type?: string;
      errors?: Record<string, string[]>;
      detail?: string;
      title?: string;
      message?: string;
    };
  };
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    age: '',
    gender: 0,
    role: 1 // 1: ولي أمر (افتراضي)، 0: طبيب
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const handleGenderChange = (value: number) => {
    setFormData({ ...formData, gender: value });
  };

  const handleRoleChange = (value: number) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateSignup(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; 
    }

    setIsLoading(true);
    setErrors({});
    setServerError('');

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        gender: Number(formData.gender),
        role: Number(formData.role)
      };

      await registerApi(payload);
      
      // التوجيه لصفحة انتظار تأكيد الإيميل مع تمرير الإيميل وكمان الـ role عشان نعرف نوجهه فين بعد الكونفيرم
      navigate('/pending-verification', { 
        state: { 
          email: formData.email, 
          role: formData.role 
        } 
      }); 
      
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Server Error Response:", error.response?.data);
      
      const status = error.response?.status;
      const responseData = error.response?.data;

      if (status === 409 || responseData?.type === 'Auth.UserAlreadyExists') {
        setErrors({ email: 'هذا البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد آخر.' });
      } else if (responseData?.errors) {
        const errorString = JSON.stringify(responseData.errors).toLowerCase();
        if (errorString.includes('password') || errorString.includes('مرور')) {
          setErrors({ password: 'كلمة المرور غير مقبولة من الخادم.' });
        } else {
          setServerError('يرجى مراجعة البيانات المدخلة.');
        }
      } else {
        const genericMessage = responseData?.detail || responseData?.title || responseData?.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب.';
        setServerError(genericMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`bg-white p-8 lg:p-10 ${styles.cardShadow}`}>
        <h2 className="text-3xl font-extrabold text-[#581C87] mb-2">إنشاء حساب</h2>
        <p className="text-sm font-bold text-gray-600 mb-6">انضم إلينا وابدأ رحلتك نحو التقدم اليوم.</p>

        {serverError && (
          <div className="mb-4 text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex flex-col gap-5">
            

            {/* الاسم الكامل */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">الاسم الكامل</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.fullName ? 'border-red-500' : ''}`}>
                <User className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="أدخل اسمك الكامل" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" />
              </div>
              {errors.fullName && <span className="text-red-500 text-xs font-bold">{errors.fullName}</span>}
            </div>

            {/* البريد الإلكتروني */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">البريد الإلكتروني</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.email ? 'border-red-500' : ''}`}>
                <Mail className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="أدخل بريدك الإلكتروني" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" />
              </div>
              {errors.email && <span className="text-red-500 text-xs font-bold">{errors.email}</span>}
            </div>

            {/* رقم الهاتف */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">رقم الهاتف</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.phoneNumber ? 'border-red-500' : ''}`}>
                <Phone className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="رقم الهاتف" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" />
              </div>
              {errors.phoneNumber && <span className="text-red-500 text-xs font-bold">{errors.phoneNumber}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">العمر</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.age ? 'border-red-500' : ''}`}>
                <Calendar className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="number" min="0" name="age" value={formData.age} onChange={handleChange} placeholder="العمر" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" />
              </div>
              {errors.age && <span className="text-red-500 text-xs font-bold">{errors.age}</span>}
            </div>

            {/* النوع (Radio Buttons) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">النوع</label>
              <div className={`flex items-center justify-around bg-white px-4 py-3 ${styles.inputContainer}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={0} checked={formData.gender === 0} onChange={() => handleGenderChange(0)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-sm font-bold text-[#1E1B4B]">ذكر</span>
                </label>
                <div className="w-px h-5 bg-gray-200"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={1} checked={formData.gender === 1} onChange={() => handleGenderChange(1)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-sm font-bold text-[#1E1B4B]">أنثى</span>
                </label>
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">كلمة المرور</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.password ? 'border-red-500' : ''}`}>
                <Lock className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-300 tracking-widest mr-2 min-w-0" />
                <Eye className="w-5 h-5 text-[#581C87] cursor-pointer flex-shrink-0" onClick={() => setShowPassword(!showPassword)} />
              </div>
              {errors.password && <span className="text-red-500 text-xs font-bold leading-relaxed">{errors.password}</span>}
            </div>
          </div>

          
            {/* اختيار نوع الحساب (ولي أمر / طبيب) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">نوع الحساب</label>
              <div className={`flex items-center justify-around bg-white px-4 py-3 ${styles.inputContainer}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={1} checked={formData.role === 1} onChange={() => handleRoleChange(1)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-sm font-bold text-[#1E1B4B]">ولي أمر</span>
                </label>
                <div className="w-px h-5 bg-gray-200"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={0} checked={formData.role === 0} onChange={() => handleRoleChange(0)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-sm font-bold text-[#1E1B4B]">طبيب</span>
                </label>
              </div>
            </div>

          <button disabled={isLoading} type="submit" className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold text-[15px] py-3.5 rounded-full flex justify-center items-center gap-2 mt-6 ${styles.buttonShadow}`}>
            {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب'}
            {!isLoading && <ArrowLeft className="w-5 h-5" strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-bold text-gray-500">
          لديك حساب بالفعل؟ <a href="/login" className="text-[#581C87] hover:underline mr-1">سجل الدخول</a>
        </div>
      </div>
    </AuthLayout>
  );
}