import { useState } from 'react';
import { Mail, Lock, Eye, ArrowLeft, User, Phone, Calendar, Award, Building2, FileText, UploadCloud, FileCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { registerApi } from '../../api/authApi'; 
import styles from '../../layouts/AuthLayout/SharedAuth.module.css';
import { validateSignup } from '../../utils/validations/validations'; 

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
    role: 1, // 1: ولي أمر (افتراضي)، 0: طبيب
    yearsOfExperience: '',
    clinicName: '',
    professionalBio: '',
    practiceLicense: null as File | null,
    syndicateCard: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if (name === 'yearsOfExperience') {
      value = value.replace(/[^0-9]/g, '');
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setServerError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'practiceLicense' | 'syndicateCard') => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [fieldName]: 'حجم الملف يجب ألا يتجاوز 5 ميجابايت.' }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
    setServerError('');
  };

  const removeFile = (fieldName: 'practiceLicense' | 'syndicateCard') => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleGenderChange = (value: number) => {
    setFormData({ ...formData, gender: value });
  };

  const handleRoleChange = (value: number) => {
    setFormData({ ...formData, role: value });
    if (errors.yearsOfExperience || errors.clinicName || errors.professionalBio || errors.practiceLicense || errors.syndicateCard) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.yearsOfExperience;
        delete copy.clinicName;
        delete copy.professionalBio;
        delete copy.practiceLicense;
        delete copy.syndicateCard;
        return copy;
      });
    }
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
      const isDoctor = Number(formData.role) === 0;

      interface RegisterResponse {
        userId?: string;
        id?: string;
        data?: {
          value?: { userId?: string };
          userId?: string;
          id?: string;
        };
        value?: { userId?: string };
      }

      let response: RegisterResponse;

      if (isDoctor) {
        const payload = new FormData();
        payload.append('fullName', formData.fullName.trim());
        payload.append('email', formData.email.trim());
        payload.append('phoneNumber', formData.phoneNumber.trim());
        payload.append('password', formData.password);
        payload.append('age', String(Number(formData.age)));
        payload.append('gender', String(Number(formData.gender)));
        payload.append('role', '0');

        if (formData.yearsOfExperience !== '') {
          payload.append('yearsOfExperience', String(Number(formData.yearsOfExperience)));
        }
        if (formData.clinicName.trim()) {
          payload.append('clinicName', formData.clinicName.trim());
        }
        if (formData.professionalBio.trim()) {
          payload.append('professionalBio', formData.professionalBio.trim());
        }
        if (formData.practiceLicense) {
          payload.append('practiceLicense', formData.practiceLicense);
        }
        if (formData.syndicateCard) {
          payload.append('syndicateCard', formData.syndicateCard);
        }

        response = await registerApi(payload);
      } else {
        const payload = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password,
          age: Number(formData.age),
          gender: Number(formData.gender),
          role: 1,
        };

        response = await registerApi(payload);
      }
      
      const newUserId = response?.data?.value?.userId || response?.data?.id || response?.data?.userId || response?.value?.userId || response?.userId || '';

      navigate('/verify-otp', { 
        state: { 
          userId: newUserId, 
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
        <h2 className="text-4xl font-extrabold text-[#581C87] mb-2">إنشاء حساب</h2>
        <p className="text-base font-bold text-gray-600 mb-6">انضم إلينا وابدأ رحلتك نحو التقدم اليوم.</p>

        {serverError && (
          <div className="mb-4 text-red-500 text-base font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>نوع الحساب</label>
              <div className={`flex items-center justify-around bg-white px-4 py-3 ${styles.inputContainer}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={1} checked={formData.role === 1} onChange={() => handleRoleChange(1)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-base font-bold text-[#1E1B4B]">ولي أمر</span>
                </label>
                <div className="w-px h-5 bg-gray-200"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={0} checked={formData.role === 0} onChange={() => handleRoleChange(0)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-base font-bold text-[#1E1B4B]">طبيب</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>الاسم الكامل</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.fullName ? 'border-red-500' : ''}`}>
                <User className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="أدخل اسمك الكامل" className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" />
              </div>
              {errors.fullName && <span className="text-red-500 text-sm font-bold">{errors.fullName}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>البريد الإلكتروني</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.email ? 'border-red-500' : ''}`}>
                <Mail className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="أدخل بريدك الإلكتروني" className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" />
              </div>
              {errors.email && <span className="text-red-500 text-sm font-bold">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>رقم الهاتف</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.phoneNumber ? 'border-red-500' : ''}`}>
                <Phone className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="رقم الهاتف" className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" />
              </div>
              {errors.phoneNumber && <span className="text-red-500 text-sm font-bold">{errors.phoneNumber}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>العمر</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.age ? 'border-red-500' : ''}`}>
                <Calendar className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type="number" min="0" name="age" value={formData.age} onChange={handleChange} placeholder="العمر" className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" />
              </div>
              {errors.age && <span className="text-red-500 text-sm font-bold">{errors.age}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>النوع</label>
              <div className={`flex items-center justify-around bg-white px-4 py-3 ${styles.inputContainer}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={0} checked={formData.gender === 0} onChange={() => handleGenderChange(0)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-base font-bold text-[#1E1B4B]">ذكر</span>
                </label>
                <div className="w-px h-5 bg-gray-200"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={1} checked={formData.gender === 1} onChange={() => handleGenderChange(1)} className="w-4 h-4 accent-[#581C87] cursor-pointer" />
                  <span className="text-base font-bold text-[#1E1B4B]">أنثى</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={styles.inputLabel}>كلمة المرور</label>
              <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.password ? 'border-red-500' : ''}`}>
                <Lock className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-300 placeholder:text-sm placeholder:md:text-base tracking-widest mr-2 min-w-0" />
                <Eye className="w-5 h-5 text-[#581C87] cursor-pointer flex-shrink-0" onClick={() => setShowPassword(!showPassword)} />
              </div>
              {errors.password && <span className="text-red-500 text-xs font-bold leading-relaxed">{errors.password}</span>}
            </div>

            {/* حقول خاصة بالطبيب تظهر فقط عند اختيار دور "طبيب" (role === 0) */}
            {formData.role === 0 && (
              <div className="flex flex-col gap-5 pt-3 border-t-2 border-dashed border-[#EBE5F7]">
                <h3 className="text-base font-extrabold text-[#581C87]">البيانات المهنية والوثائق للطبيب</h3>

                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>سنوات الخبرة</label>
                  <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.yearsOfExperience ? 'border-red-500' : ''}`}>
                    <Award className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                    <input 
                      type="text" 
                      inputMode="numeric"
                      name="yearsOfExperience" 
                      value={formData.yearsOfExperience} 
                      onChange={handleChange} 
                      placeholder="عدد سنوات الخبرة (مثال: 5)" 
                      className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    />
                  </div>
                  {errors.yearsOfExperience && <span className="text-red-500 text-sm font-bold">{errors.yearsOfExperience}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>اسم العيادة</label>
                  <div className={`flex items-center bg-white px-4 py-3 ${styles.inputContainer} ${errors.clinicName ? 'border-red-500' : ''}`}>
                    <Building2 className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                    <input 
                      type="text" 
                      name="clinicName" 
                      value={formData.clinicName} 
                      onChange={handleChange} 
                      placeholder="أدخل اسم العيادة أو المركز الطبي" 
                      className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0" 
                    />
                  </div>
                  {errors.clinicName && <span className="text-red-500 text-sm font-bold">{errors.clinicName}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>نبذة مهنية</label>
                  <div className={`flex items-start bg-white px-4 py-3 ${styles.inputContainer} ${errors.professionalBio ? 'border-red-500' : ''}`}>
                    <FileText className="w-5 h-5 text-[#581C87] flex-shrink-0 mt-1" />
                    <textarea 
                      name="professionalBio" 
                      value={formData.professionalBio} 
                      onChange={handleChange} 
                      placeholder="اكتب نبذة مختصرة عن مؤهلاتك وخبراتك الطبية..." 
                      rows={3}
                      className="bg-transparent border-none outline-none flex-1 font-bold text-[#1E1B4B] placeholder-gray-400 placeholder:text-sm placeholder:md:text-base mr-2 min-w-0 resize-none" 
                    />
                  </div>
                  {errors.professionalBio && <span className="text-red-500 text-sm font-bold">{errors.professionalBio}</span>}
                </div>

                {/* ترخيص ممارسة المهنة (مطلوب للطبيب) */}
                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>
                    ترخيص ممارسة المهنة <span className="text-red-500">*</span>
                  </label>
                  {!formData.practiceLicense ? (
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors bg-[#F9F7FD] hover:bg-[#F3EBFB] ${errors.practiceLicense ? 'border-red-500' : 'border-[#581C87]/30'}`}>
                      <UploadCloud className="w-7 h-7 text-[#581C87] mb-1" />
                      <span className="text-sm font-bold text-[#1E1B4B]">اضغط لاختيار ملف ترخيص ممارسة المهنة (PDF, PNG, JPG)</span>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">الحد الأقصى 5 ميجابايت</span>
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*" 
                        onChange={(e) => handleFileChange(e, 'practiceLicense')} 
                        className="hidden" 
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-[#F3EBFB] border border-[#581C87]/30 px-4 py-3 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#1E1B4B] truncate">{formData.practiceLicense.name}</span>
                          <span className="text-xs text-gray-500 font-medium">({(formData.practiceLicense.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('practiceLicense')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {errors.practiceLicense && <span className="text-red-500 text-sm font-bold">{errors.practiceLicense}</span>}
                </div>

                {/* كارنيه النقابة (مطلوب للطبيب) */}
                <div className="flex flex-col gap-1">
                  <label className={styles.inputLabel}>
                    كارنيه النقابة <span className="text-red-500">*</span>
                  </label>
                  {!formData.syndicateCard ? (
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors bg-[#F9F7FD] hover:bg-[#F3EBFB] ${errors.syndicateCard ? 'border-red-500' : 'border-[#581C87]/30'}`}>
                      <UploadCloud className="w-7 h-7 text-[#581C87] mb-1" />
                      <span className="text-sm font-bold text-[#1E1B4B]">اضغط لاختيار ملف كارنيه النقابة (PDF, PNG, JPG)</span>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">الحد الأقصى 5 ميجابايت</span>
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*" 
                        onChange={(e) => handleFileChange(e, 'syndicateCard')} 
                        className="hidden" 
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-[#F3EBFB] border border-[#581C87]/30 px-4 py-3 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-5 h-5 text-[#581C87] flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#1E1B4B] truncate">{formData.syndicateCard.name}</span>
                          <span className="text-xs text-gray-500 font-medium">({(formData.syndicateCard.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('syndicateCard')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {errors.syndicateCard && <span className="text-red-500 text-sm font-bold">{errors.syndicateCard}</span>}
                </div>

              </div>
            )}

          </div>

          <button disabled={isLoading} type="submit" className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold rounded-full flex justify-center items-center gap-2 mt-6 py-3.5 ${styles.buttonShadow}`}>
            {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب'}
            {!isLoading && <ArrowLeft className="w-5 h-5" strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-bold text-gray-500">
          لديك حساب بالفعل؟ <a href="/login" className="text-[#581C87] hover:underline mr-1">سجل الدخول</a>
        </div>
      </div>
    </AuthLayout>
  );
}
