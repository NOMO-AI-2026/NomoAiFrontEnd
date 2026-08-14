import React, { useState } from 'react';
import { X, Search, Phone, Link, CheckCircle, UserCheck } from 'lucide-react';
import styles from './AssignParentModal.module.css';
import { searchParentByPhoneApi, assignParentToChildApi } from '../../../api/doctorApi';
import { useAppDispatch } from '../../../store/hooks';
import { fetchChildProfile } from '../../../store/slices/childProfileSlice/childProfileSlice';
import UserAvatar from '../../UserAvatar/UserAvatar';

interface AssignParentModalProps {
  childId: number;
  onClose: () => void;
}

interface ParentSearchResult {
  parentId: string | number;
  fullname: string;
  phoneNumber: string;
  email?: string;
}

const AssignParentModal: React.FC<AssignParentModalProps> = ({ childId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ParentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assigningId, setAssigningId] = useState<string | number | null>(null);
  const [assignedParentId, setAssignedParentId] = useState<string | number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const dispatch = useAppDispatch(); 

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setIsSearching(true);
    setErrorMsg('');
    setSearchResults([]);

    try {
      const response = await searchParentByPhoneApi(searchTerm);
      const data = response.data;
      
      let resultsArray: ParentSearchResult[] = [];
      if (data) {
        if (Array.isArray(data)) {
          resultsArray = data;
        } else if (data.items && Array.isArray(data.items)) {
          resultsArray = data.items;
        } else if (data.value && Array.isArray(data.value)) {
          resultsArray = data.value;
        } else if (data.value?.items && Array.isArray(data.value.items)) {
          resultsArray = data.value.items;
        }
      }
      
      if (resultsArray.length > 0) {
        setSearchResults(resultsArray);
      } else {
        setErrorMsg("لم يتم العثور على نتائج مطابقة.");
      }
    } catch (error: unknown) {
      console.error("خطأ في البحث:", error);
      const apiError = (error as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.message || (error as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.error || (error as { message?: string }).message || "حدث خطأ أثناء البحث.";
      setErrorMsg(`فشل البحث: ${apiError}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssign = async (parentId: string | number) => {
    setAssigningId(parentId);
    
    try {
      await assignParentToChildApi(childId, parentId);
      setAssignedParentId(parentId);
      
      dispatch(fetchChildProfile(childId)); 
      
    } catch (error: unknown) {
      console.error("خطأ في الربط:", error);
      const apiError = (error as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.message || (error as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.error || (error as { message?: string }).message || "حدث خطأ أثناء الربط، يرجى المحاولة مرة أخرى.";
      alert(`رفض من السيرفر: ${apiError}`);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>
              <UserCheck size={22} style={{ color: '#581C87' }} />
              <span>ربط ولي أمر</span>
            </h2>
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
                  <div className={styles.parentInfo}>
                    <div className={`${styles.avatar} ${index % 2 === 0 ? styles.avatarPurple : styles.avatarLight}`}>
                      <UserAvatar type="parent" size={30} />
                    </div>
                    <div className={styles.parentDetails}>
                      <h3 className={styles.parentName}>{parent.fullname || 'بدون اسم'}</h3>
                      <div className={styles.contactRow}>
                        <Phone size={14} />
                        <span dir="ltr">{parent.phoneNumber || 'لا يوجد رقم هاتف'}</span>
                      </div>
                      {parent.email && <div className={styles.parentEmail}>{parent.email}</div>}
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
      </div>
    </div>
  );
};

export default AssignParentModal;