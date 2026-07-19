import React, { useState } from 'react';
import { addChildApi } from '../../../api/doctorApi';
import { X } from 'lucide-react'; // ضفنا الأيقونة عشان زرار الإغلاق
import styles from './AddChildModal.module.css';

interface AddChildModalProps {
  onClose: () => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({ onClose }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState(0); 
  const [therapyStartDate, setTherapyStartDate] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [speechLevelId, setSpeechLevelId] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        fullName,
        dateOfBirth, 
        gender,
        therapyStartDate,
        age: Number(age),
        speechLevelId: Number(speechLevelId)
      };

      await addChildApi(payload);
      
      onClose(); 
      window.dispatchEvent(new Event('refreshChildrenList'));

    } catch (error: unknown) {
      console.log("تفاصيل الخطأ من الباك إند:", (error as { response?: { data?: unknown } }).response?.data);
      alert("حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>إضافة طفل جديد</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={`p-4 rounded-2xl bg-[#F8F7FF] text-[#6C34AF] font-bold text-sm mb-6 flex items-center gap-2 ${styles.infoAlert}`}>
            <span>💡</span>
            <p>يرجى التأكد من إدخال جميع البيانات بدقة لضمان تسجيل الطفل بنجاح.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
د            <div>
              <label className="block text-sm font-extrabold text-[#211A44] mb-2">الاسم بالكامل</label>
              <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                <input 
                  type="text" 
                  required
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent outline-none py-2 text-[#211A44] font-bold placeholder-gray-400"
                  placeholder="أدخل اسم الطفل رباعياً"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">تاريخ الميلاد</label>
                <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                  <input 
                    type="date" 
                    required
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-transparent outline-none py-2 text-[#211A44] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">العمر</label>
                <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                  <input 
                    type="number" 
                    required min="0"
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-transparent outline-none py-2 text-[#211A44] font-bold placeholder-gray-400"
                    placeholder="مثال: 5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">النوع</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGender(0)}
                    className={`flex-1 py-3 rounded-xl font-extrabold text-lg transition ${gender === 0 ? styles.genderBtnActive : styles.genderBtn}`}
                  >
                    ولد
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender(1)}
                    className={`flex-1 py-3 rounded-xl font-extrabold text-lg transition ${gender === 1 ? styles.genderBtnActive : styles.genderBtn}`}
                  >
                    بنت
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#211A44] mb-2">مستوى النطق (ID)</label>
                <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                  <input 
                    type="number" 
                    required min="0"
                    value={speechLevelId} 
                    onChange={(e) => setSpeechLevelId(Number(e.target.value))}
                    className="w-full bg-transparent outline-none py-2 text-[#211A44] font-bold"
                    placeholder="رقم المستوى"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-[#211A44] mb-2">تاريخ بداية العلاج</label>
              <div className={`rounded-xl px-4 py-1 ${styles.inputContainer}`}>
                <input 
                  type="date" 
                  required
                  value={therapyStartDate} 
                  onChange={(e) => setTherapyStartDate(e.target.value)}
                  className="w-full bg-transparent outline-none py-2 text-[#211A44] font-bold"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-black text-xl disabled:opacity-50 ${styles.primaryBtn}`}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ بيانات الطفل'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddChildModal;