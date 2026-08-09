import { useEffect, useState } from 'react';
import { CreditCard, ChevronRight, ChevronLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { getDoctorTransactionsApi } from '../../api/paymentApi';
import { type PaymentsQueryParams } from '../../types/payment.types';
import styles from './DoctorTransactions.module.css';

interface PlanPurchase {
  id: number;
  planName: string;
  purchasedMinutes: number;
  purchasedPrice: number;
}

interface Transaction {
  id: number;
  type: number; // 0 for purchase, 1 for deduction (session consumption)
  minutes: number;
  balanceAfter: number;
  createdAt: string;
  planPurchase: PlanPurchase | null;
  session: unknown | null;
}

const DoctorTransactions = () => {
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
        
        const response = await getDoctorTransactionsApi(params);
        
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

  const renderType = (tx: Transaction) => {
    // 0 = Purchase (إضافة للرصيد), 1 = Session Deduction (خصم من الرصيد)
    if (tx.type === 0) {
      return (
        <div className={`${styles.typeBadge} ${styles.typePurchase}`}>
          <ArrowUpRight size={16} />
          <span>شراء باقة ({tx.planPurchase?.planName || 'غير معروف'})</span>
        </div>
      );
    } else {
      return (
        <div className={`${styles.typeBadge} ${styles.typeDeduction}`}>
          <ArrowDownRight size={16} />
          <span>استهلاك جلسة</span>
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
        <div>
          <h1 className={styles.welcomeTitle}>سجل العمليات</h1>
          <p className={styles.welcomeSubtitle}>تابع استهلاك الجلسات وعمليات شراء الباقات الخاصة بك</p>
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
                <th>نوع العملية</th>
                <th>الدقائق (إضافة/خصم)</th>
                <th>الرصيد المتبقي</th>
                <th>المبلغ المدفوع</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{renderType(tx)}</td>
                  <td>
                    <span className={styles.amount} style={{ color: tx.type === 0 ? '#059669' : '#DC2626' }}>
                      {tx.type === 0 ? '+' : '-'}{tx.minutes} د
                    </span>
                  </td>
                  <td>
                    <span className={styles.amount}>{tx.balanceAfter} د</span>
                  </td>
                  <td>
                    {tx.type === 0 && tx.planPurchase ? (
                      <span className={styles.amount}>{tx.planPurchase.purchasedPrice} ج.م</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      {formatDate(tx.createdAt)}
                    </div>
                  </td>
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

export default DoctorTransactions;
