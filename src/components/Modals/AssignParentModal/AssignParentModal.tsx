import React, { useState } from 'react';
import { X, Search, Phone, Link, CheckCircle } from 'lucide-react';
import styles from './AssignParentModal.module.css';
import { searchParentByPhoneApi, assignParentToChildApi } from '../../../api/doctorApi';
import { useAppDispatch } from '../../../store/hooks'; // 1. استيراد الـ hook الخاص بـ Redux
import { fetchChildProfile } from '../../../store/slices/childProfileSlice'; // 2. استيراد دالة التحديث

interface AssignParentModalProps {
  childId: number;
  onClose: () => void;
}

const AssignParentModal: React.FC<AssignParentModalProps> = ({ childId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assigningId, setAssigningId] = useState<string | number | null>(null);
  const [assignedParentId, setAssignedParentId] = useState<string | number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const dispatch = useAppDispatch(); // 3. تهيئة الـ dispatch

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setIsSearching(true);
    setErrorMsg('');
    setSearchResults([]);

    try {
      const response = await searchParentByPhoneApi(searchTerm);
      const data = response.data;
      const resultsArray = data.items || [];
      
      if (resultsArray.length > 0) {
        setSearchResults(resultsArray);
      } else {
        setErrorMsg("لم يتم العثور على نتائج مطابقة.");
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      setErrorMsg("حدث خطأ أثناء البحث، تأكد من البيانات.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssign = async (parentId: string | number) => {
    setAssigningId(parentId);
    
    try {
      await assignParentToChildApi(childId, parentId);
      setAssignedParentId(parentId);
      
      // 4. السحر هنا: تحديث بيانات البروفايل فوراً بعد الربط
      dispatch(fetchChildProfile(childId)); 
      
    } catch (error: any) {
      console.error("خطأ في الربط:", error);
      if (error.response && error.response.data) {
        alert(`رفض من السيرفر: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("حدث خطأ أثناء الربط، يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>ربط ولي أمر</h2>
            <p className={styles.subtitle}>ابحث باستخدام رقم الهاتف، الاسم، أو الإيميل</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSearch} className={styles.inputGroup}>
            <label className={styles.inputLabel}>كلمة البحث</label>
            <div className={styles.searchRow}>
              <div className={styles.inputContainer}>
                <Search className={styles.inputIcon} size={20} />
                <input 
                  type="text" 
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="أدخل رقم الموبايل أو الاسم..." 
                  className={styles.input}
                />
              </div>
              <button type="submit" disabled={isSearching} className={styles.searchBtn}>
                <span>{isSearching ? 'جاري...' : 'بحث'}</span>
                {!isSearching && <Search size={18} />}
              </button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm mt-2 font-bold">{errorMsg}</p>}
          </form>

          {searchResults.length > 0 && (
            <div className={styles.resultsContainer}>
              {searchResults.map((parent, index) => (
                <div key={parent.parentId || index} className={styles.resultCard}>
                  <div className={styles.userInfo}>
                    <div className={`${styles.avatar} ${index % 2 === 0 ? styles.avatarPurple : styles.avatarLight}`}>
                      {parent.fullname ? parent.fullname.charAt(0) : 'أ'}
                    </div>
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{parent.fullname || 'بدون اسم'}</h3>
                      <div className={styles.contactRow}>
                        <Phone size={14} />
                        <span dir="ltr">{parent.phoneNumber || 'لا يوجد رقم هاتف'}</span>
                      </div>
                      {parent.email && <div className={styles.emailText}>{parent.email}</div>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAssign(parent.parentId)} 
                    disabled={assigningId === parent.parentId || assignedParentId === parent.parentId}
                    className={`${styles.assignBtn} ${assignedParentId === parent.parentId ? styles.successBtn : ''}`}
                  >
                    {assignedParentId === parent.parentId ? (
                      <>
                        <span>تم الربط</span>
                        <CheckCircle size={16} />
                      </>
                    ) : (
                      <>
                        <span>{assigningId === parent.parentId ? 'جاري...' : 'ربط'}</span>
                        <Link size={16} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn}>
            {assignedParentId ? 'إغلاق' : 'إلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignParentModal;