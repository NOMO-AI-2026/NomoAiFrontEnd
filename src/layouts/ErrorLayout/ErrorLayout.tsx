import { Link } from "react-router-dom";

const ErrorLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8F7FF',
      textAlign: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* 404 Visual */}
      <div style={{
        fontSize: '150px',
        fontWeight: '800',
        color: '#581C87',
        lineHeight: '1',
        marginBottom: '24px',
        textShadow: '6px 6px 0px #FACC15'
      }}>
        404
      </div>
      
      {/* Error Message */}
      <h1 style={{
        fontSize: '40px',
        fontWeight: '800',
        color: '#1E1B4B',
        marginBottom: '24px'
      }}>
        عفواً، الصفحة غير موجودة
      </h1>
      
      <p style={{
        fontSize: '20px',
        color: '#1E1B4B',
        marginBottom: '40px',
        maxWidth: '500px',
        opacity: '0.8'
      }}>
        يبدو أنك ضللت الطريق. الصفحة التي تبحث عنها غير موجودة أو تم نقلها لمكان آخر.
      </p>

      {/* Navigation Button */}
      <Link 
        to="/" 
        style={{
          padding: '16px 40px',
          backgroundColor: '#FACC15',
          color: '#1E1B4B',
          fontWeight: '800',
          fontSize: '18px',
          borderRadius: '9999px',
          border: '4px solid #1E1B4B',
          boxShadow: '8px 8px 0px #1E1B4B',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '12px 12px 0px #1E1B4B';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '8px 8px 0px #1E1B4B';
        }}
      >
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
};

export default ErrorLayout;