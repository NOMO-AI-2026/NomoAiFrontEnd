import { useState } from 'react';
import { Lock, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { resetPasswordApi } from '../../api/authApi';
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [form, setForm] = useState({
    email: emailFromState,
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.otp || !form.newPassword || !form.confirmNewPassword) {
      setError('جميع الحقول مطلوبة.');
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    const isLengthValid = form.newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(form.newPassword);
    const hasLowercase = /[a-z]/.test(form.newPassword);
    const hasNumber = /\d/.test(form.newPassword);
    const hasSpecialChar = /[\W_]/.test(form.newPassword);

    if (!isLengthValid || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتحتوي على حرف كبير (A-Z)، وحرف صغير (a-z)، ورقم (0-9)، ورمز خاص واحد على الأقل.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPasswordApi(form);
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
      console.error("Reset Password Error:", apiError.response?.data);

      if (apiError.response?.status === 400) {
        const data = apiError.response.data;
        if (data?.errors) {
          const messages = Object.values(data.errors).flat().join(' ');
          setError(messages || 'البيانات المدخلة غير صحيحة.');
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError('رمز التحقق غير صحيح أو منتهي الصلاحية.');
        }
      } else if (apiError.response?.status === 404) {
        setError('البريد الإلكتروني غير مسجل لدينا.');
      } else {
        setError('حدث خطأ أثناء إعادة تعيين كلمة المرور، يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`bg-white p-8 lg:p-10 ${styles.cardShadow} transition-all duration-300`}>

        {isSuccess ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-[#581C87] mb-3">تم بنجاح!</h2>
              <p className="text-base font-bold text-gray-600 leading-relaxed">
                تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold rounded-full mt-4 ${styles.buttonShadow}`}
            >
              تسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-extrabold text-[#581C87] mb-2">إعادة تعيين كلمة المرور</h2>
            <p className="text-base font-bold text-gray-600 mb-8 leading-relaxed">
              أدخل رمز التحقق المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              
              {/* البريد الإلكتروني (مخفي إذا جاء من صفحة نسيت كلمة المرور) */}
              {!emailFromState && (
                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>البريد الإلكتروني</label>
                  <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                    <KeyRound className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      placeholder="أدخل بريدك الإلكتروني" 
                      className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    />
                  </div>
                </div>
              )}

              {/* رمز التحقق OTP */}
              <div className="flex flex-col gap-1">
                <label className={styles.inputLabel}>رمز التحقق (OTP)</label>
                <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                  <KeyRound className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                  <input 
                    type="text" 
                    name="otp" 
                    value={form.otp} 
                    onChange={handleChange} 
                    placeholder="أدخل رمز التحقق" 
                    className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    autoComplete="one-time-code"
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>

              {/* كلمة المرور الجديدة */}
              <div className="flex flex-col gap-1">
                <label className={styles.inputLabel}>كلمة المرور الجديدة</label>
                <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                  <Lock className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="newPassword" 
                    value={form.newPassword} 
                    onChange={handleChange} 
                    placeholder="أدخل كلمة المرور الجديدة" 
                    className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0 text-gray-500 hover:text-[#581C87] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور الجديدة */}
              <div className="flex flex-col gap-1">
                <label className={styles.inputLabel}>تأكيد كلمة المرور الجديدة</label>
                <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                  <Lock className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmNewPassword" 
                    value={form.confirmNewPassword} 
                    onChange={handleChange} 
                    placeholder="أعد إدخال كلمة المرور الجديدة" 
                    className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="flex-shrink-0 text-gray-500 hover:text-[#581C87] transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <span className="text-red-500 text-sm font-bold block">{error}</span>}

              <button disabled={isLoading} type="submit" className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}>
                {isLoading ? 'جاري الإرسال...' : 'إعادة تعيين كلمة المرور'}
                {!isLoading && <ArrowLeft className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-bold text-gray-500">
              تذكرت كلمة المرور؟ <Link to="/login" className="text-[#581C87] hover:underline mr-1">العودة لتسجيل الدخول</Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
