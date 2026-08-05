import React, { useState, useEffect } from 'react';
import { X, Edit2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../../store/hooks';
import { addChildNote, updateChildNote } from '../../../store/slices/childProfileSlice'; 
import styles from './NoteModal.module.css'; // استيراد ملف الستايل

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  noteToEdit: any | null; 
  onSuccess: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, childId, noteToEdit, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setDescription(noteToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      return toast.error('يرجى ملء جميع الحقول');
    }

    setIsSubmitting(true);
    try {
      if (noteToEdit) {
        await dispatch(updateChildNote({ 
          noteId: noteToEdit.id, 
          title: title, 
          description: description 
        })).unwrap();
        toast.success('تم تعديل الملاحظة بنجاح');
      } else {
        await dispatch(addChildNote({ 
          childId: childId, 
          noteTitle: title, 
          noteContent: description 
        })).unwrap();
        toast.success('تم إضافة الملاحظة بنجاح');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الملاحظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>
            {noteToEdit ? <Edit2 size={24} color="#581C87" /> : <PlusCircle size={24} color="#581C87" />}
            {noteToEdit ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>عنوان الملاحظة</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="مثال: تحسن في نطق حرف الراء"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>التفاصيل</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="اكتب تفاصيل ملاحظتك هنا..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.actions}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;