import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getTickets } from '../../../store/slices/supportTicketsSlice';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal'; 
import TicketDetailsModal from '../../../components/Modals/TicketDetailsModal/TicketDetailsModal';
import { deleteTicket } from '../../../api/supportTicketsApi'; 
import styles from './SupportTickets.module.css';
import UserAvatar from '../../../components/UserAvatar/UserAvatar';

// تعريف نوع التابات الجديد بناءً على الحالات الـ 4
type TabType = 'all' | 'unread' | 'inProgress' | 'resolved' | 'closed';

const SupportTickets = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.supportTickets);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTickets = useCallback((page: number, tab: TabType, searchName: string) => {
    let statusFilter: string | undefined = undefined;
    
    // ترجمة التابات للأرقام الخاصة بالباك إند
    if (tab === 'unread') statusFilter = '0'; 
    if (tab === 'inProgress') statusFilter = '1'; 
    if (tab === 'resolved') statusFilter = '2'; 
    if (tab === 'closed') statusFilter = '3'; 

    dispatch(getTickets({
      PageNumber: page,
      PageSize: 10,
      Status: statusFilter,
      Name: searchName || undefined
    }));
  }, [dispatch]);

  useEffect(() => {
    fetchTickets(currentPage, activeTab, debouncedSearch);
  }, [fetchTickets, currentPage, activeTab, debouncedSearch]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1); 
  };

  const handleViewDetails = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (ticketId: number) => {
    setTicketToDelete(ticketId);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async (): Promise<void> => {
    if (ticketToDelete === null) return;
    
    await deleteTicket(ticketToDelete);
    
    fetchTickets(currentPage, activeTab, debouncedSearch);
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
  };



  // دالة مساعدة لترجمة الرقم لبيانات الحالة (اسم ولون)
  const getTicketStatus = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'لم تُقرأ', color: '#D97706' };
      case 1:
        return { label: 'قيد المعالجة', color: '#2563EB' };
      case 2:
        return { label: 'تم الحل', color: '#059669' };
      case 3:
        return { label: 'مغلقة', color: '#4B5563' };
      default:
        return { label: 'غير محدد', color: '#6B7280' };
    }
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>تذاكر الدعم</h1>
          <p className={styles.subtitle}>متابعة وحل مشكلات الأطباء وأولياء الأمور في المنصة.</p>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="البحث عن طريق اسم المرسل..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
            className={`${styles.tabBtn} ${activeTab === 'unread' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('unread')}
          >
            غير مقروءة
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'inProgress' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('inProgress')}
          >
            قيد المعالجة
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('resolved')}
          >
            تم الحل
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'closed' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('closed')}
          >
            مغلقة
          </button>
        </div>
      </div>

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
              data?.items.map((ticket) => {
                const statusData = getTicketStatus(ticket.status);
                
                return (
                  <tr 
                    key={ticket.id}
                    className={styles.clickableRow}
                    onClick={() => handleViewDetails(ticket.id)}
                  >
                    <td>
                      <div className={styles.senderInfo}>
                        <div className={styles.avatar}>
                          <UserAvatar type={ticket.userRole === 'Doctor' ? 'doctor' : 'parent'} size={28} />
                        </div>
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
                      <span 
                        className={styles.badge} 
                        style={{ 
                          color: statusData.color, 
                          backgroundColor: `${statusData.color}15`,
                          border: `1px solid ${statusData.color}40`
                        }}
                      >
                        <span className={styles.dot} style={{ backgroundColor: statusData.color }}></span>
                        {statusData.label}
                      </span>
                    </td>
                    <td>
                      {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={`${styles.actionBtn} ${styles.actionDelete}`}
                          title="حذف التذكرة"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(ticket.id); }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && data && data.items.length > 0 && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
             الصفحة {data.pageNumber} من {data.totalPages} 
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={!data.hasPreviousPage}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronRight size={18} />
                السابق
              </button>
              <button 
                className={styles.pageBtn} 
                disabled={!data.hasNextPage}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                التالي
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="حذف التذكرة"
        message="هل أنت متأكد من رغبتك في حذف هذه التذكرة؟ لن تتمكن من استرجاعها بعد الحذف."
      />

      <TicketDetailsModal 
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTicketId(null);
        }}
        ticketId={selectedTicketId}
        onActionSuccess={() => {
          fetchTickets(currentPage, activeTab, debouncedSearch);
        }}
      />

    </div>
  );
};

export default SupportTickets;