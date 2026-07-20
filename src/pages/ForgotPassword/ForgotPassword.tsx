import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { forgotPasswordApi } from '../../api/authApi'; 
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    if (!email) {
      setError("البريد الإلكتروني مطلوب.");
      return;
    } else if (!emailRegex.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPasswordApi(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Forgot Password Error:", err.response?.data);
      const responseData = err.response?.data;
      const errorString = JSON.stringify(responseData || "").toLowerCase();
      
      if (err.response?.status === 404 || errorString.includes('found') || errorString.includes('user')) {
        setError('هذا البريد الإلكتروني غير مسجل لدينا.');
      } else {
        setError('حدث خطأ أثناء إرسال الرابط، يرجى المحاولة لاحقاً.');
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
              <h2 className="text-3xl font-extrabold text-[#581C87] mb-3">تحقق من بريدك!</h2>
              <p className="text-sm font-bold text-gray-600 leading-relaxed">
                لقد أرسلنا رابط استعادة كلمة المرور إلى البريد الإلكتروني:<br/>
                <span className="text-[#581C87]">{email}</span>
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold text-[15px] py-3.5 rounded-full mt-4 ${styles.buttonShadow}`}
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-[#581C87] mb-2">نسيت كلمة المرور؟</h2>
            <p className="text-sm font-bold text-gray-600 mb-8 leading-relaxed">
              لا تقلق! أدخل بريدك الإلكتروني المسجل لدينا وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">البريد الإلكتروني</label>
                <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer} ${error ? 'border-red-500' : ''}`}>
                  <Mail className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                  <input type="email" name="email" value={email} onChange={handleChange} placeholder="أدخل بريدك الإلكتروني" className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400 mr-2 min-w-0" />
                </div>
                {error && <span className="text-red-500 text-xs font-bold">{error}</span>}
              </div>

              <button disabled={isLoading} type="submit" className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold text-[15px] py-3.5 rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}>
                {isLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                {!isLoading && <ArrowLeft className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
              </button>
            </form>

            <div className="mt-8 text-center text-xs font-bold text-gray-500">
              تذكرت كلمة المرور؟ <Link to="/login" className="text-[#581C87] hover:underline mr-1">العودة لتسجيل الدخول</Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}