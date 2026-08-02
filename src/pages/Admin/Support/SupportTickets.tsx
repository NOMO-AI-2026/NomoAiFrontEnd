import { useEffect, useState } from 'react';
import { Search, ChevronRight, ChevronLeft, Eye, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getTickets } from '../../../store/slices/supportTicketsSlice';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal'; 
import { deleteTicket } from '../../../api/supportTicketsApi'; 
import styles from './SupportTickets.module.css';

const SupportTickets = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.supportTickets);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  // دالة مساعدة لجلب البيانات عشان نستخدمها في الـ useEffect وبعد الحذف
  const fetchTickets = (page: number, tab: string) => {
    let statusFilter: string | undefined = undefined;
    if (tab === 'open') statusFilter = '0'; 
    if (tab === 'closed') statusFilter = '1'; 

    dispatch(getTickets({
      PageNumber: page,
      PageSize: 10,
      Status: statusFilter
    }));
  };

  // تحديث البيانات بناءً على التاب أو الصفحة
  useEffect(() => {
    fetchTickets(currentPage, activeTab);
  }, [dispatch, currentPage, activeTab]);

  const handleTabChange = (tab: 'all' | 'open' | 'closed') => {
    setActiveTab(tab);
    setCurrentPage(1); 
  };

  const handleViewDetails = (ticketId: number) => {
    // سيتم ربطها بالـ Modal لاحقاً
    console.log("View ticket:", ticketId);
  };

  // 1. فتح المودال وتخزين رقم التذكرة
  const handleDeleteClick = (ticketId: number) => {
    setTicketToDelete(ticketId);
    setIsDeleteModalOpen(true);
  };

  // 2. تنفيذ عملية الحذف الفعلية (دي اللي بيبعتها للمودال)
  const executeDelete = async (): Promise<void> => {
    if (ticketToDelete === null) return;
    
    // المودال بيهندل الـ try/catch جواه فمش محتاجين نكررها هنا
    await deleteTicket(ticketToDelete);
    
    // ريفريش للبيانات بعد الحذف
    fetchTickets(currentPage, activeTab);
  };

  // استخراج أول حرفين للصورة الرمزية
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      
      {/* الهيدر */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>تذاكر الدعم</h1>
          <p className={styles.subtitle}>متابعة وحل مشكلات الأطباء وأولياء الأمور في المنصة.</p>
        </div>
      </div>

      {/* قسم الفلتر والبحث */}
      <div className={styles.filterSection}>

        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="البحث عن طريق بريد المرسل..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('all')}
          >
            الكل
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'open' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('open')}
          >
            مفتوحة
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'closed' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('closed')}
          >
            مغلقة
          </button>
        </div>
      </div>

      {/* الجدول */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المرسل</th>
              <th>عنوان المشكلة</th>
              <th>الحالة</th>
              <th>تاريخ الإرسال</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.loadingOrEmpty}>جاري تحميل التذاكر...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className={styles.loadingOrEmpty}>حدث خطأ: {error}</td>
              </tr>
            ) : data?.items?.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.loadingOrEmpty}>لا توجد تذاكر متطابقة مع بحثك.</td>
              </tr>
            ) : (
              data?.items.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div className={styles.senderInfo}>
                      <div className={styles.avatar}>{getInitials(ticket.userFullName)}</div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{ticket.userFullName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          {ticket.userRole === 'Doctor' ? 'طبيب' : 'ولي أمر'} • {ticket.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.ticketSubject} title={ticket.subject}>
                      {ticket.subject}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${ticket.status === 0 ? styles.badgeOpen : styles.badgeClosed}`}>
                      <span className={styles.dot} style={{ backgroundColor: ticket.status === 0 ? '#CA8A04' : '#16A34A' }}></span>
                      {ticket.status === 0 ? 'مفتوحة' : 'مغلقة'}
                    </span>
                  </td>
                  <td>
                    {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionView}`}
                        title="عرض التفاصيل"
                        onClick={() => handleViewDetails(ticket.id)}
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        title="حذف التذكرة"
                        onClick={() => handleDeleteClick(ticket.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* الترقيم (Pagination) */}
        {!loading && data && data.items.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
             الصفحة {data.pageNumber} من {data.totalPages} 
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={!data.hasNextPage}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight size={18} />
                التالي
              </button>
              <button 
                className={styles.pageBtn} 
                disabled={!data.hasPreviousPage}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                السابق
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* مودال الحذف الموحد */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="حذف التذكرة"
        message="هل أنت متأكد من رغبتك في حذف هذه التذكرة؟ لن تتمكن من استرجاعها بعد الحذف."
      />

    </div>
  );
};

export default SupportTickets;