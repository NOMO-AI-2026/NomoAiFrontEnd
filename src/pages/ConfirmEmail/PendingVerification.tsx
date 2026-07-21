import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MailOpen, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import sharedStyles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { resendEmailConfirmationApi } from '../../api/authApi';

export default function PendingVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const emailFromSignup = location.state?.email || '';
  const userRole = location.state?.role; // بنستقبل الـ role (0 للطبيب، 1 لولي الأمر)

  const [email, setEmail] = useState(emailFromSignup);
  const [timer, setTimer] = useState(60); 
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  // دالة لتوجيه المستخدم بعد التأكيد بناءً على الـ Role
  const handleRedirectAfterVerification = () => {
    if (userRole === 0) {
      navigate('/pending-approval'); // لو طبيب، يروح لصفحة انتظار موافقة الأدمن
    } else {
      navigate('/login'); // لو ولي أمر، يروح لتسجيل الدخول مباشرة
    }
  };

  // 1. التايمر بتاع إعادة الإرسال
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // لو التابة التانية غيرت القيمة دي، معناه إن الحساب اتأكد
      if (e.key === 'email_verified_signal') {
        // نمسح الإشارة عشان النضافة
        localStorage.removeItem('email_verified_signal');
        // نودي اليوزر للمكان المخصص حسب نوع حسابه
        handleRedirectAfterVerification();
      }
    };

    // تشغيل المراقب
    window.addEventListener('storage', handleStorageChange);
    
    // تنظيف المراقب لو اليوزر قفل الصفحة
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, userRole]);

  const handleResend = async () => {
    if (!email) {
      setMessage('يرجى إدخال البريد الإلكتروني أولاً.');
      return;
    }
    if (timer > 0) return;

    setIsResending(true);
    setMessage('');
    try {
      await resendEmailConfirmationApi({ email });
      setMessage('تم إرسال الرابط بنجاح! يرجى فحص صندوق الوارد.');
      setTimer(60); 
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || 'حدث خطأ أثناء إرسال الرابط.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`${sharedStyles.cardShadow} p-8 w-full max-w-md mx-auto text-center flex flex-col gap-6`}>
        
        <MailOpen className="mx-auto text-[#581C87]" size={64} strokeWidth={2} />
        
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1E1B4B]">تحقق من بريدك!</h2>
          <p className="text-gray-600 font-bold text-lg leading-relaxed">
            لقد أرسلنا رابط تفعيل حسابك إلى البريد الإلكتروني. يرجى الضغط عليه لتتمكن من المتابعة. 
            <br />
            <span className="text-[#581C87] text-sm">(هذه الصفحة ستنتقل تلقائياً عند التأكيد)</span>
          </p>
        </div>

        <div className="border-t-2 border-dashed border-[#EBE5F7] pt-6 flex flex-col gap-4 mt-2">
          <p className="text-[#1E1B4B] font-bold text-sm">
            لم يصلك الإيميل؟ أو يوجد خطأ في العنوان؟
          </p>

          <div className={sharedStyles.inputContainer}>
            <input 
              type="email" 
              className="w-full p-3 px-4 font-bold text-[#1E1B4B] outline-none bg-transparent placeholder-gray-400 text-right" 
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>

          <button 
            onClick={handleResend}
            disabled={isResending || timer > 0}
            className={`${sharedStyles.buttonShadow} bg-[#FACC15] text-[#1E1B4B] font-extrabold text-lg py-3 px-6 rounded-xl w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isResending ? 'جاري الإرسال...' : timer > 0 ? `إعادة الإرسال بعد (${timer}) ثانية` : 'إرسال رابط جديد'}
          </button>

          {message && (
            <p className={`text-sm font-bold ${message.includes('بنجاح') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {message}
            </p>
          )}
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-2 text-[#581C87] font-extrabold hover:text-[#1E1B4B] transition-colors mt-2 cursor-pointer"
        >
          العودة لتسجيل الدخول
          <ArrowRight size={18} />
        </button>

      </div>
    </AuthLayout>
  );
}