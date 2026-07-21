import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import sharedStyles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { confirmEmailApi, resendEmailConfirmationApi } from '../../api/authApi';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // استلام البيانات من صفحة التسجيل
  const userId = location.state?.userId || '';
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // مصفوفة للتحكم في تنقلات المؤشر بين مربعات الإدخال
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // التأكد من وجود userId، لو مش موجود نرجعه للوجين
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  // عداد الـ 60 ثانية لإعادة الإرسال
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // التعامل مع كتابة الأرقام في المربعات
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // التأكد إنه رقم فقط
    
    const newOtp = [...otp];
    // لو المستخدم عمل لصق أو كتب رقم، بناخد آخر رقم بس
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // نقل المؤشر للمربع التالي تلقائياً
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // التعامل مع زر الـ Backspace للرجوع للمربع السابق
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      setError('يرجى إدخال الكود المكون من 6 أرقام بالكامل.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await confirmEmailApi({ userId, otp: otpCode });
      setSuccessMsg('تم تأكيد حسابك بنجاح! جاري التوجيه...');
      
      // توجيه تلقائي بعد نجاح التأكيد
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'الكود غير صحيح أو منتهي الصلاحية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);
    setResendMsg('');
    setError('');

    try {
      await resendEmailConfirmationApi({ userId });
      setResendMsg('تم إرسال كود جديد بنجاح.');
      setTimer(60); 
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'حدث خطأ أثناء إعادة إرسال الكود.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`bg-white p-8 lg:p-10 ${sharedStyles.cardShadow} max-w-md mx-auto text-center`}>
        
        <ShieldCheck className="mx-auto text-[#581C87] mb-4" size={56} strokeWidth={2} />
        
        <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-2">تأكيد البريد الإلكتروني</h2>
        <p className="text-base font-bold text-gray-600 mb-6 leading-relaxed">
          أرسلنا كود التأكيد إلى <br />
          <span className="text-[#581C87]" dir="ltr">{email}</span>
        </p>

        {error && (
          <div className="mb-4 text-red-500 text-base font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-green-600 text-base font-bold bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          
          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-extrabold text-[#1E1B4B] bg-gray-50 border-2 rounded-xl outline-none transition-all focus:border-[#581C87] focus:bg-white focus:shadow-[0_0_0_4px_rgba(88,28,135,0.15)] ${
                  digit ? 'border-[#581C87]' : 'border-gray-200'
                }`}
              />
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || successMsg !== ''}
            className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold rounded-full flex justify-center items-center gap-2 mt-4 ${sharedStyles.buttonShadow} disabled:opacity-70`}
          >
            {isLoading ? 'جاري التأكيد...' : 'تأكيد الحساب'}
          </button>
        </form>

        <div className="mt-8 border-t-2 border-dashed border-[#EBE5F7] pt-6">
          <p className="text-gray-600 font-bold text-base mb-3">لم يصلك الكود؟</p>
          
          <button 
            onClick={handleResend}
            disabled={isResending || timer > 0}
            className={`w-full bg-white text-[#1E1B4B] border-2 border-[#1E1B4B] font-extrabold text-base py-3 rounded-xl transition-all ${
              timer > 0 ? 'opacity-50 cursor-not-allowed' : `hover:bg-gray-50 ${sharedStyles.buttonShadow}`
            }`}
          >
            {isResending ? 'جاري الإرسال...' : timer > 0 ? `إعادة الإرسال بعد (${timer}) ثانية` : 'إرسال كود جديد'}
          </button>

          {resendMsg && (
            <p className="mt-3 text-base font-bold text-green-600">
              {resendMsg}
            </p>
          )}
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-[#581C87] transition-colors mt-6 w-full text-base"
        >
          العودة لتسجيل الدخول
          <ArrowRight size={16} />
        </button>

      </div>
    </AuthLayout>
  );
}