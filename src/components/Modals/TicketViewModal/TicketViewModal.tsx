import React from 'react';
import { X, Shield } from 'lucide-react';
import styles from './TicketViewModal.module.css';

interface TicketDetails {
  id: number;
  subject: string;
  message: string;
  adminNote?: string | null;
}

interface TicketViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketDetails: TicketDetails | null;
}

const TicketViewModal: React.FC<TicketViewModalProps> = ({ isOpen, onClose, ticketDetails }) => {
  if (!isOpen || !ticketDetails) return null;

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Shield className="ml-2 mb-1 inline-block" size={24} style={{ color: '#581C87' }} />
            تفاصيل التذكرة 
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.messageBox}>
            <h4 className={styles.subjectText}>{ticketDetails.subject}</h4>
            <p className={styles.messageText}>{ticketDetails.message}</p>
          </div>

          {ticketDetails.adminNote ? (
            <div className={styles.adminNoteBox}>
              <h4 className={styles.adminNoteTitle}>رد الإدارة:</h4>
              <p className={styles.adminNoteText}>{ticketDetails.adminNote}</p>
            </div>
          ) : (
            <div className={styles.noReply}>
              لم يتم الرد من قبل الإدارة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketViewModal;