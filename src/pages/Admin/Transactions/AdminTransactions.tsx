import { useEffect, useState } from 'react';
import { CreditCard, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getAdminPaymentsApi } from '../../../api/paymentApi';
import { type PaymentsQueryParams } from '../../../types/payment.types';
import styles from './AdminTransactions.module.css';

interface DoctorInfo {
  name: string;
  email: string;
  phone: string;
}

interface Transaction {
  id: number;
  doctorId: number;
  doctor: DoctorInfo;
  paymentMethodName: string;
  amount: number;
  status: number;
  createdAt: string;
  paidAtUtc: string | null;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params: PaymentsQueryParams = {
          pageNumber: page,
          pageSize: 10,
        };
        
        const response = await getAdminPaymentsApi(params);
        
        if (response?.value?.items) {
          setTransactions(response.value.items);
          setTotalPages(response.value.totalPages || 1);
        } else {
          setTransactions([]);
          setTotalPages(1);
        }
      } catch (error: unknown) {
        console.error("Error fetching transactions:", error);
        setTransactions([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const renderStatus = (status: number) => {
    switch (status) {
      case 1:
        return (
          <div className={`${styles.statusBadge} ${styles.statusSuccess}`}>
            <CheckCircle2 size={16} />
            <span>مدفوع</span>
          </div>
        );
      case 2:
        return (
          <div className={`${styles.statusBadge} ${styles.statusFailed}`}>
            <XCircle size={16} />
            <span>فشلت العملية</span>
          </div>
        );
      case 3:
        return (
          <div className={`${styles.statusBadge} ${styles.statusCancelled}`}>
            <XCircle size={16} />
            <span>ملغاة</span>
          </div>
        );
      case 0:
      default:
        return (
          <div className={`${styles.statusBadge} ${styles.statusPending}`}>
            <Clock size={16} />
            <span>قيد الانتظار</span>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>العمليات المالية</h1>
          <p className={styles.subtitle}>إدارة ومتابعة جميع عمليات الدفع والاشتراكات</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>جاري تحميل العمليات...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.loadingContainer}>
            <CreditCard size={48} color="#9CA3AF" style={{ marginBottom: '1rem' }} />
            <p>لا توجد عمليات مالية لعرضها</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الطبيب</th>
                <th>طريقة الدفع</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div className={styles.doctorInfo}>
                      <span className={styles.doctorName}>{tx.doctor?.name || 'غير معروف'}</span>
                      <span className={styles.doctorEmail}>{tx.doctor?.email || '-'}</span>
                    </div>
                  </td>
                  <td>{tx.paymentMethodName || '-'}</td>
                  <td>
                    <span className={styles.amount}>{tx.amount} ج.م</span>
                  </td>
                  <td>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      {formatDate(tx.createdAt)}
                    </div>
                  </td>
                  <td>{renderStatus(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            صفحة {page} من {totalPages}
          </span>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronRight size={18} />
              السابق
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              التالي
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
