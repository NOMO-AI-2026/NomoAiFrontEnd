import React, { useState, useEffect } from 'react';
import { X, Edit2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../../store/hooks';
import { addChildNote, updateChildNote } from '../../../store/slices/childProfileSlice'; 
import { type DoctorNote } from '../../../api/doctorApi';
import styles from './NoteModal.module.css';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  noteToEdit: DoctorNote | null; 
  onSuccess: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, childId, noteToEdit, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setDescription(noteToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [noteToEdit, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    } catch (error: unknown) {
      console.error(error);
      toast.error('حدث خطأ أثناء حفظ الملاحظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>
              {noteToEdit ? (
                <>
                  <Edit2 size={20} className="inline-block ml-2 text-[#581C87]" />
                  تعديل الملاحظة
                </>
              ) : (
                <>
                  <PlusCircle size={20} className="inline-block ml-2 text-[#581C87]" />
                  إضافة ملاحظة جديدة
                </>
              )}
            </h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>عنوان الملاحظة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الملاحظة..."
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>محتوى الملاحظة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل تفاصيل الملاحظة..."
              className={styles.textarea}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : (noteToEdit ? 'حفظ التعديلات' : 'إضافة الملاحظة')}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
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