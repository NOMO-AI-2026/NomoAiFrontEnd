import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './SupportTickets.module.css';

// استيراد الـ API
import { 
  fetchMyTickets, 
  fetchMyTicketById, 
  createMyTicket, 
  updateMyTicket, 
  deleteMyTicket 
} from '../../api/supportTicketsApi';

// استيراد المودالز
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';
import TicketFormModal from '../../components/Modals/TicketFormModal/TicketFormModal';
import TicketViewModal from '../../components/Modals/TicketViewModal/TicketViewModal';

interface Ticket {
  id: number;
  subject: string;
  status: number; 
  createdAt: string;
}

interface TicketDetails {
  id: number;
  subject: string;
  message: string;
  adminNote?: string | null;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // حالات المودالز
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // الداتا
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicketDetails, setActiveTicketDetails] = useState<TicketDetails | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchMyTickets({ pageNumber: page, pageSize: 12 })
      .then((response) => {
        if (isMounted && response?.items) {
          setTickets(response.items);
          setTotalPages(response.totalPages || 1);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
        toast.error('حدث خطأ أثناء جلب التذاكر');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, refreshTrigger]);

  const loadTickets = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getStatusDisplay = (status: number) => {
    switch(status) {
      case 0: return { label: 'مفتوحة', className: styles.badgeOpen };
      case 1: return { label: 'جاري العمل', className: styles.badgeInProgress };
      case 2: return { label: 'مغلقة', className: styles.badgeClosed };
      default: return { label: 'غير معروف', className: styles.badgeOpen };
    }
  };

  const handleOpenCreate = () => {
    setSelectedTicketId(null);
    setActiveTicketDetails(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (id: number) => {
    setSelectedTicketId(id);
    const loadingToast = toast.loading('جاري تحميل بيانات التذكرة...');
    try {
      const details = await fetchMyTicketById(id);
      setActiveTicketDetails(details);
      toast.dismiss(loadingToast);
      setIsFormModalOpen(true);
    } catch {
      toast.dismiss(loadingToast);
      toast.error('فشل في تحميل التذكرة');
    }
  };

  // دالة الحفظ اللي هنمررها لمودال الفورم
  const handleSaveTicket = async (formData: { subject: string; message: string }) => {
    setIsSubmitting(true);
    try {
      if (selectedTicketId) {
        await updateMyTicket(selectedTicketId, formData);
        toast.success('تم تعديل التذكرة بنجاح');
      } else {
        await createMyTicket(formData);
        toast.success('تم إرسال التذكرة بنجاح');
      }
      setIsFormModalOpen(false);
      loadTickets();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; message?: string } } };
      console.error("Backend Error:", error.response?.data);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicket = async (id: number) => {
    const loadingToast = toast.loading('جاري تحميل التفاصيل...');
    try {
      const details = await fetchMyTicketById(id);
      setActiveTicketDetails(details);
      toast.dismiss(loadingToast);
      setIsViewModalOpen(true);
    } catch {
      toast.dismiss(loadingToast);
      toast.error('فشل في تحميل التفاصيل');
    }
  };

  const confirmDelete = async () => {
    if (!selectedTicketId) throw new Error("لم يتم تحديد تذكرة");
    await deleteMyTicket(selectedTicketId);
    toast.success('تم حذف التذكرة بنجاح');
    loadTickets();
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>تذاكر الدعم الفني</h1>
          <p className={styles.subtitle}>تواصل معنا لحل مشاكلك وتابع ردود الإدارة.</p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenCreate}>
          <Plus size={20} />
          إنشاء تذكرة
        </button>
      </div>

      <div className={styles.cardsContainer}>
        {loading ? (
          <div className={styles.loading}>جاري تحميل التذاكر...</div>
        ) : tickets.length === 0 ? (
          <div className={styles.empty}>لا يوجد تذاكر لعرضها. انقر على "إنشاء تذكرة" للبدء.</div>
        ) : (
          tickets.map((ticket) => {
            const statusInfo = getStatusDisplay(ticket.status);
            const isOpen = ticket.status === 0; 

            return (
              <div 
                key={ticket.id} 
                className={styles.card} 
                onClick={() => handleViewTicket(ticket.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.badge} ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <h3 className={styles.cardTitle}>{ticket.subject}</h3>
                
                <div className={styles.cardFooter}>
                  <div className={styles.date}>
                    <Calendar size={16} />
                    <span>{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  
                  {isOpen && (
                    <div className={styles.actions}>
                      <button 
                        title="تعديل" 
                        className={`${styles.actionBtn} ${styles.actionEdit}`}
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(ticket.id); }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        title="حذف" 
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedTicketId(ticket.id); setIsDeleteModalOpen(true); }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* عناصر التحكم في الصفحات Pagination */}
      {!loading && tickets.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            الصفحة {page} من {totalPages}
          </div>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={18} />
              التالي
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              السابق
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ================= المودالز المفصولة ================= */}

      <TicketFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveTicket}
        initialData={selectedTicketId ? activeTicketDetails : null}
        isSubmitting={isSubmitting}
        isEditMode={!!selectedTicketId}
      />

      <TicketViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        ticketDetails={activeTicketDetails}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف التذكرة"
        message="هل أنت متأكد من رغبتك في حذف هذه التذكرة؟ لا يمكن التراجع عن هذا الإجراء."
        deleteBtnText="حذف التذكرة"
      />

    </div>
  );
};

export default SupportTickets;