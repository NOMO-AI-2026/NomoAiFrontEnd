import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './UpdateSpeechLevelModal.module.css';
import { updateSpeechLevelApi, getSpeechLevelsApi, type SpeechLevel } from '../../../api/doctorApi';
import { useAppDispatch } from '../../../store/hooks';
import { fetchChildProfile } from '../../../store/slices/childProfileSlice';
import { type ChildProfileData } from '../../../types/child.types';

interface UpdateSpeechLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  profileData: ChildProfileData; 
}

const UpdateSpeechLevelModal: React.FC<UpdateSpeechLevelModalProps> = ({ isOpen, onClose, childId, profileData }) => {
  const [speechLevelId, setSpeechLevelId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechLevels, setSpeechLevels] = useState<SpeechLevel[]>([]);
  const [isFetchingLevels, setIsFetchingLevels] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen) {
      const fetchLevels = async () => {
        setIsFetchingLevels(true);
        try {
          const response = await getSpeechLevelsApi();
          if (response && response.value) {
            setSpeechLevels(response.value);
          }
        } catch (error) {
          console.error("Error fetching speech levels:", error);
        } finally {
          setIsFetchingLevels(false);
        }
      };
      fetchLevels();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        fullName: profileData.fullName,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        therapyStartDate: profileData.therapyStartDate,
        age: profileData.age,
        speechLevelId: Number(speechLevelId),
        speechLevelChangeReasons: reason
      };

      await updateSpeechLevelApi(childId, payload);
      
      dispatch(fetchChildProfile(childId));
      
      setSpeechLevelId('');
      setReason('');
      onClose();

    } catch (error: unknown) {
      console.error("Error updating level:", error);
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || "حدث خطأ أثناء تحديث المستوى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>تحديث مستوى الكلام</h2>
            <p className={styles.subtitle}>الرجاء إدخال رقم المستوى الجديد وسبب التغيير</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-sm font-extrabold text-[#1E1B4B]">مستوى النطق الجديد</label>
              <div className={styles.inputContainer}>
                <select 
                  required
                  value={speechLevelId} 
                  onChange={(e) => setSpeechLevelId(Number(e.target.value))}
                  className="w-full bg-transparent outline-none py-2 text-[#1E1B4B] font-bold"
                  style={{ border: 'none', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  <option value="" disabled>{isFetchingLevels ? 'جاري التحميل...' : 'اختر مستوى النطق...'}</option>
                  {speechLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.levelName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-[#1E1B4B]">سبب التحديث / ملاحظات</label>
              <div className={styles.inputContainer}>
                <textarea 
                  required
                  rows={3}
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-transparent outline-none py-2 text-[#1E1B4B] font-bold resize-none"
                  placeholder="أدخل سبب انتقال الطفل لهذا المستوى..."
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !speechLevelId || !reason}
              className={styles.primaryBtn}
            >
              {isLoading ? 'جاري التحديث...' : 'حفظ المستوى الجديد'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateSpeechLevelModal;