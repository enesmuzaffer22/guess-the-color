import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../firebase';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Giriş yap
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Kayıt ol
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Kullanıcı adını güncelle
        await updateProfile(userCredential.user, {
          displayName: formData.displayName
        });
      }
      onAuthSuccess();
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/weak-password':
        return 'Şifre en az 6 karakter olmalıdır.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-not-found':
        return 'Kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Yanlış şifre.';
      case 'auth/invalid-api-key':
        return 'Firebase API anahtarı geçersiz. Lütfen .env dosyasını kontrol edin.';
      case 'auth/configuration-not-found':
        return 'Firebase konfigürasyonu bulunamadı.';
      case 'auth/project-not-found':
        return 'Firebase projesi bulunamadı.';
      case 'auth/quota-exceeded':
        return 'Günlük kullanım kotası aşıldı.';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      case 'auth/operation-not-allowed':
        return 'Email/Password girişi etkinleştirilmemiş. Firebase Console\'dan Authentication > Sign-in method > Email/Password\'u aktif edin.';
      default:
        return `Bir hata oluştu: ${errorCode}. Lütfen konsolu kontrol edin.`;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="displayName"
                placeholder="Kullanıcı Adı"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="E-posta"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>
        
        <p className="auth-switch">
          {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="switch-button"
          >
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth; 