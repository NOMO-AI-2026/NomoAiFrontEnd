import React, { useState, useEffect } from 'react';
import { addChildApi, updateChildApi, getSpeechLevelsApi } from '../../../api/doctorApi';
import { X } from 'lucide-react';
import styles from './AddChildModal.module.css';
import { useAppDispatch } from '../../../store/hooks'; 
import { fetchChildProfile } from '../../../store/slices/childProfileSlice'; 

interface AddChildModalProps {
  onClose: () => void;
  editData?: any; 
}

const AddChildModal: React.FC<AddChildModalProps> = ({ onClose, editData }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState(0); 
  const [therapyStartDate, setTherapyStartDate] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [speechLevelId, setSpeechLevelId] = useState<number | ''>('');
  
  // State للمستويات
  const [speechLevels, setSpeechLevels] = useState<{ id: number, levelName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const isEditMode = !!editData; 

  // جلب المستويات عند فتح المودال في حالة الإضافة
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getSpeechLevelsApi();
        // بما أن السيرفر يرجع { value: [...] }
        if (response && response.value) {
          setSpeechLevels(response.value);
        }
      } catch (err) {
        console.error("خطأ في جلب المستويات:", err);
      }
    };

    if (!isEditMode) {
      fetchLevels();
    }
  }, [isEditMode]);

  // حساب العمر تلقائياً
  useEffect(() => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge > 0 ? calculatedAge : 0);
    } else {
      setAge('');
    }
  }, [dateOfBirth]);

  // تحديث البيانات عند فتح المودال
  useEffect(() => {
    if (editData) {
      console.log("البيانات القادمة للتعديل:", editData);
      setFullName(editData.fullName || '');
      setGender(editData.gender ?? 0);
      setSpeechLevelId(''); 
      if (editData.dateOfBirth) setDateOfBirth(editData.dateOfBirth.split('T')[0]);
      if (editData.therapyStartDate) setTherapyStartDate(editData.therapyStartDate.split('T')[0]);
    } else {
      setFullName('');
      setDateOfBirth('');
      setGender(0);
      setTherapyStartDate('');
      setAge('');
      setSpeechLevelId('');
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const payload: any = {
      fullName,
      dateOfBirth,
      gender,
      therapyStartDate,
      age: Number(age),
      // تأكدي إن القيمة دايماً رقم
      speechLevelId: isEditMode 
        ? (editData.speechLevelId || (editData.speechLevel?.id) || 5) 
        : Number(speechLevelId),
      speechLevelChangeReasons: "" 
    };

    console.log("الـ Payload النهائي:", payload);

    if (isEditMode) {
      await updateChildApi(editData.id, payload); 
      dispatch(fetchChildProfile(editData.id)); 
    } else {
      await addChildApi(payload);
      window.dispatchEvent(new Event('refreshChildrenList'));
    }
    onClose(); 
  } catch (error: any) {
    console.log("الخطأ:", error);
    alert("حدث خطأ أثناء حفظ البيانات.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditMode ? 'تعديل بيانات الطفل' : 'إضافة طفل جديد'}</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>
        <div className={styles.content}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-extrabold text-[#211A44] mb-2">الاسم بالكامل</label>
              <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-transparent outline-none py-3 text-[#211A44] font-bold" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">تاريخ الميلاد</label>
                <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                  <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full bg-transparent outline-none py-3 text-[#211A44] font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">العمر</label>
                <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                  <input type="number" value={age} readOnly className="w-full bg-transparent outline-none py-3 text-[#211A44] font-bold opacity-70 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">النوع</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setGender(0)} className={`flex-1 py-3 rounded-xl font-extrabold ${gender === 0 ? styles.genderBtnActive : styles.genderBtn}`}>ولد</button>
                  <button type="button" onClick={() => setGender(1)} className={`flex-1 py-3 rounded-xl font-extrabold ${gender === 1 ? styles.genderBtnActive : styles.genderBtn}`}>بنت</button>
                </div>
              </div>
              
              {!isEditMode && (
                <div>
                  <label className="block text-sm font-extrabold text-[#211A44] mb-2">مستوى النطق</label>
                  <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                    <select 
                      required 
                      value={speechLevelId} 
                      onChange={(e) => setSpeechLevelId(Number(e.target.value))}
                      className="w-full bg-transparent outline-none py-3 text-[#211A44] font-bold"
                    >
                      <option value="">اختر المستوى</option>
                      {speechLevels.map((level) => (
                        <option key={level.id} value={level.id}>{level.levelName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-extrabold text-[#211A44] mb-2">تاريخ بداية العلاج</label>
              <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                <input type="date" required value={therapyStartDate} onChange={(e) => setTherapyStartDate(e.target.value)} className="w-full bg-transparent outline-none py-3 text-[#211A44] font-bold" />
              </div>
            </div>
            
            <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-2xl font-black text-xl ${styles.primaryBtn}`}>
              {isLoading ? 'جاري الحفظ...' : (isEditMode ? 'تحديث البيانات' : 'حفظ بيانات الطفل')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddChildModal;