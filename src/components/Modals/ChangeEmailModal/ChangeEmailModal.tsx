import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { changeEmailApi, confirmEmailChangeApi } from '../../../api/authApi'; 
import styles from './ChangeEmailModal.module.css';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeEmailModal({ isOpen, onClose }: ChangeEmailModalProps) {
  const [step, setStep] = useState(1); // 1: طلب التغيير, 2: إدخال الـ OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // بيانات الخطوة الأولى
  const [formData, setFormData] = useState({ currentPassword: '', newEmail: '' });
  
  // بيانات الخطوة التانية (OTP)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // تايمر إعادة الإرسال
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  // إعادة ضبط الـ Modal
  const handleClose = () => {
    setStep(1);
    setFormData({ currentPassword: '', newEmail: '' });
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccessMsg('');
    onClose();
  };
// ----------------- Step 1: Request Change -----------------
  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newEmail) {
      setError('جميع الحقول مطلوبة.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await changeEmailApi(formData);
      setStep(2); // التبديل لشاشة الـ OTP
      setTimer(60);
    } catch (err: unknown) {
      // تعديل هنا لاصطياد الـ 409 Conflict
      const apiError = err as { response?: { status?: number; data?: { message?: string } } };
      
      if (apiError.response?.status === 409) {
        setError('هذا البريد الإلكتروني مسجل بالفعل بحساب آخر، يرجى استخدام بريد مختلف.');
      } else if (apiError.response?.status === 400 || apiError.response?.status === 401) {
        setError('كلمة المرور الحالية غير صحيحة.');
      } else {
        setError(apiError.response?.data?.message || 'حدث خطأ أثناء طلب التغيير، يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // ----------------- Step 2: Verify OTP -----------------
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('يرجى إدخال الكود بالكامل.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await confirmEmailChangeApi({ otp: otpCode });
      
      setSuccessMsg('تم تغيير البريد الإلكتروني بنجاح!');
      
      setTimeout(() => {
        handleClose();
        window.location.reload(); 
      }, 2000);

    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'الكود غير صحيح أو منتهي الصلاحية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      await changeEmailApi(formData);
      setTimer(60);
    } catch (err: unknown) {
      setError('حدث خطأ أثناء إعادة الإرسال.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Mail size={22} style={{ color: '#581C87' }} />
            {step === 1 ? 'تغيير البريد الإلكتروني' : 'تأكيد البريد الإلكتروني'}
          </h2>
          <button onClick={handleClose} disabled={isLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          {successMsg && <div className={styles.successMsg}><CheckCircle2 size={18} />{successMsg}</div>}

         {/* ================= الخطوة الأولى ================= */}
          {step === 1 && (
            <form onSubmit={handleRequestChange} className={styles.form} autoComplete="off">
              <p className={styles.subtitle} style={{textAlign: 'center', marginBottom: '1rem'}}>
                يرجى إدخال كلمة المرور الحالية والبريد الجديد.
              </p>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>كلمة المرور الحالية</label>
                <div className={styles.inputContainer}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.currentPassword} 
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} 
                    placeholder="••••••••" 
                    className={styles.input} 
                    autoComplete="new-password"
                  />
                  <Eye 
                    className={styles.inputIcon} 
                    size={20} 
                    style={{ cursor: 'pointer', marginRight: 'auto' }}
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>البريد الإلكتروني الجديد</label>
                <div className={styles.inputContainer}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email" 
                    value={formData.newEmail} 
                    onChange={(e) => setFormData({...formData, newEmail: e.target.value})} 
                    placeholder="أدخل البريد الجديد" 
                    className={`${styles.input} ${styles.inputLtr}`} 
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className={styles.buttonsRow}>
                <button disabled={isLoading} type="submit" className={styles.primaryBtn}>
                  {isLoading ? 'جاري التحقق...' : 'إرسال كود التحقق'}
                </button>
                <button type="button" onClick={handleClose} disabled={isLoading} className={styles.cancelBtn}>
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <p className={styles.subtitle} style={{textAlign: 'center', marginBottom: '1rem'}}>
                تم إرسال رمز التحقق إلى بريدك الجديد. يرجى إدخال الرمز المكون من 6 أرقام.
              </p>
              
              <div className={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={styles.otpInput}
                  />
                ))}
              </div>

              <div className={styles.buttonsRow}>
                <button disabled={isLoading || successMsg !== ''} type="submit" className={styles.primaryBtn}>
                  <span>تأكيد</span>
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={handleResendOTP} 
                  disabled={isLoading || timer > 0} 
                  className={styles.cancelBtn}
                >
                  {timer > 0 ? `إعادة الإرسال (${timer})` : 'إعادة إرسال الرمز'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}