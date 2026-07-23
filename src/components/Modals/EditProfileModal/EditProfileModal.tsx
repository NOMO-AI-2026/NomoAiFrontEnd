import { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { updateProfile, type ProfileData } from '../../../store/slices/profileSlice';
import styles from './EditProfileModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentData: ProfileData | null;
  isDoctor: boolean;
  updateLoading: boolean;
}

// 1. عملنا Type مخصص للفورم عشان التايب سكريبت ميعترضش على تحويل الأرقام لنصوص مؤقتاً
interface FormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: number;
  age: string | number;
  doctorSpecificData: {
    yearsOfExperience: string | number;
    clinicName: string;
    professionalBio: string;
  } | null;
}

const EditProfileModal = ({ isOpen, onClose, currentData, isDoctor, updateLoading }: Props) => {
  const dispatch = useAppDispatch();
  
  // 2. استخدمنا الـ Interface هنا بدل any
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 0,
    age: '',
    doctorSpecificData: null
  });

  useEffect(() => {
    if (currentData && isOpen) {
      setForm({
        fullName: currentData.fullName || '',
        phoneNumber: currentData.phoneNumber || '',
        gender: currentData.gender ?? 0,
        age: currentData.age || '', 
        email: currentData.email || '', 
        doctorSpecificData: isDoctor ? {
          yearsOfExperience: currentData.doctorSpecificData?.yearsOfExperience ?? '',
          clinicName: currentData.doctorSpecificData?.clinicName || '',
          professionalBio: currentData.doctorSpecificData?.professionalBio || ''
        } : null
      });
    }
  }, [currentData, isOpen, isDoctor]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    // فلترة الأرقام فقط
    if (name === 'age' || name === 'yearsOfExperience') {
      value = value.replace(/[^0-9]/g, ''); 
    }
    
    if (['yearsOfExperience', 'clinicName', 'professionalBio'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        doctorSpecificData: { 
          ...(prev.doctorSpecificData || { yearsOfExperience: '', clinicName: '', professionalBio: '' }), 
          // 3. استخدمنا Type Assertion هنا عشان التايب سكريبت يتأكد من المفتاح
          [name as keyof NonNullable<FormState['doctorSpecificData']>]: value 
        }
      }));
    } else {
      setForm((prev) => ({ 
        ...prev, 
        // وهنا كمان
        [name as keyof FormState]: value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // تحويل البيانات للنوع الصحيح (Numbers) قبل إرسالها للباك إند
    const payload: ProfileData = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      gender: Number(form.gender),
      age: Number(form.age) || 0,
      doctorSpecificData: isDoctor ? {
        clinicName: form.doctorSpecificData?.clinicName || null,
        professionalBio: form.doctorSpecificData?.professionalBio || null,
        yearsOfExperience: form.doctorSpecificData?.yearsOfExperience !== '' 
          ? Number(form.doctorSpecificData?.yearsOfExperience) 
          : null,
      } : null
    };

    const resultAction = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <Edit2 size={24} color="#1E1B4B" />
            <h3 className={styles.title}>تعديل البيانات</h3>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>الاسم بالكامل</label>
              <div className={styles.inputContainer}>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className={styles.input} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>رقم الهاتف</label>
              <div className={styles.inputContainer}>
                <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>النوع</label>
              <div className={styles.inputContainer}>
                <select name="gender" value={form.gender} onChange={handleChange} className={styles.input}>
                  <option value={0}>ذكر</option>
                  <option value={1}>أنثى</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>العمر</label>
              <div className={styles.inputContainer}>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  name="age" 
                  value={form.age} 
                  onChange={handleChange} 
                  className={styles.input} 
                />
              </div>
            </div>

            {isDoctor && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>سنوات الخبرة</label>
                  <div className={styles.inputContainer}>
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      name="yearsOfExperience" 
                      value={form.doctorSpecificData?.yearsOfExperience ?? ''} 
                      onChange={handleChange} 
                      className={styles.input} 
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>اسم العيادة</label>
                  <div className={styles.inputContainer}>
                    <input type="text" name="clinicName" value={form.doctorSpecificData?.clinicName ?? ''} onChange={handleChange} className={styles.input} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>نبذة مهنية</label>
                  <div className={styles.inputContainer}>
                    <textarea name="professionalBio" value={form.doctorSpecificData?.professionalBio ?? ''} onChange={handleChange} className={styles.textarea} />
                  </div>
                </div>
              </>
            )}

            <div className={styles.buttonsRow}>
              <button type="submit" className={styles.primaryBtn} disabled={updateLoading}>
                {updateLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={updateLoading}>
                إلغاء
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;