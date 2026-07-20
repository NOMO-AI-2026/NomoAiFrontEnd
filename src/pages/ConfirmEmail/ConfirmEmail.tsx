import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import sharedStyles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { confirmEmailApi, resendEmailConfirmationApi } from '../../api/authApi';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!userId || !token) {
      setStatus('error');
      setMessage('الرابط غير صالح أو مفقود منه بعض البيانات.');
      return;
    }

    const confirmAccount = async () => {
      try {
        await confirmEmailApi({ userId, token });
        setStatus('success');
        setMessage('تم تأكيد حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
        
        // إرسال إشارة للصفحة الأخرى (PendingVerification) بأن التأكيد تم
        localStorage.setItem('email_verified_signal', Date.now().toString());
        
      } catch (err: unknown) {
        setStatus('error');
        // معالجة الخطأ بطريقة آمنة في TypeScript
        const error = err as { response?: { data?: { message?: string } } };
        setMessage(error.response?.data?.message || 'حدث خطأ أثناء التأكيد. قد يكون الرابط منتهي الصلاحية.');
      }
    };

    confirmAccount();
  }, [userId, token]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!email) {
      setResendMessage('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
    
    if (timer > 0) return;

    setIsResending(true);
    setResendMessage('');
    try {
      await resendEmailConfirmationApi({ email });
      setResendMessage('تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني.');
      setTimer(60); 
    } catch (err: unknown) {
      // معالجة الخطأ بطريقة آمنة في TypeScript
      const error = err as { response?: { data?: { message?: string } } };
      setResendMessage(error.response?.data?.message || 'حدث خطأ أثناء إرسال الرابط.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`${sharedStyles.cardShadow} p-8 w-full max-w-md mx-auto text-center flex flex-col gap-6`}>
        
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto animate-spin text-[#581C87]" size={48} />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1E1B4B]">جاري تأكيد حسابك...</h2>
            <p className="text-gray-600 font-bold text-lg">يرجى الانتظار لحظات</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-[#16A34A]" size={64} />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1E1B4B]">تهانينا!</h2>
            <p className="text-gray-600 font-bold text-lg">{message}</p>
            
            <button 
              onClick={() => navigate('/login')}
              className={`${sharedStyles.buttonShadow} bg-[#FACC15] text-[#1E1B4B] font-extrabold text-lg py-3 px-6 rounded-xl mt-4 w-full cursor-pointer`}
            >
              تسجيل الدخول الآن
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-[#DC2626]" size={64} />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1E1B4B]">عذراً!</h2>
            <div className="bg-[#FEF2F2] border-2 border-dashed border-[#EF4444] text-[#DC2626] p-4 rounded-xl font-bold text-lg">
              {message}
            </div>
            
            <div className="mt-4 border-t-2 border-dashed border-[#EBE5F7] pt-6 flex flex-col gap-4">
              <p className="text-gray-600 font-bold">لم يتم التأكيد؟ أدخل بريدك لإرسال رابط جديد:</p>
              
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
                className={`${sharedStyles.buttonShadow} bg-white text-[#581C87] font-extrabold text-lg py-3 px-6 rounded-xl w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isResending ? 'جاري الإرسال...' : timer > 0 ? `إعادة الإرسال بعد (${timer}) ثانية` : 'إرسال رابط تأكيد جديد'}
              </button>

              {resendMessage && (
                <p className={`text-sm font-bold ${resendMessage.includes('تم') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {resendMessage}
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </AuthLayout>
  );
}