import { useState } from "react";
import "./LoginPage.css";

function App() {
  const [authData, setAuthData] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setStatus("Открываю окно входа...");
      // @ts-ignore
      const data = await window.electronAPI.openMicrosoftLogin();

      setAuthData(data);
      setStatus("Вход выполнен успешно!");
      console.log("Данные от Microsoft:", data);
    } catch (err) {
      setStatus("Ошибка или вход отменен");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sayHello = async () => {
    const data = await window.electronAPI.hello("Ratmir");
    console.log(data);
  };

  return (
    <div className="login-page">
      {/* Анимированный фон */}
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Карточка входа */}
      <div className="login-container">
        <div className="login-card">
          {/* Логотип и заголовок */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" />
                  <path d="M50 20 L50 50 L70 70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h1 className="login-title">Gerbarium Launcher</h1>
            <p className="login-subtitle">Добро пожаловать в мир игр</p>
          </div>

          {/* Кнопка входа */}
          <div className="login-body">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Вход...</span>
                  </>
                ) : (
                  <>
                    <svg className="microsoft-icon" viewBox="0 0 21 21" fill="currentColor">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    <span>Войти через Microsoft</span>
                  </>
                )}
              </span>
              <div className="button-glow"></div>
            </button>

            {/* Статус */}
            {status && (
              <div className={`status-message ${authData ? 'success' : 'info'}`}>
                <span className="status-icon">
                  {authData ? '✓' : '○'}
                </span>
                {status}
              </div>
            )}
          </div>

          {/* Футер */}
          <div className="login-footer">
            <p className="footer-text">
              Защищено современной системой аутентификации
            </p>
            <div className="footer-links">
              <a href="#" className="footer-link">Помощь</a>
              <span className="divider">•</span>
              <a href="#" className="footer-link">Конфиденциальность</a>
            </div>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
      </div>

      {/* Панель данных (для отладки) */}
      {authData && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>Данные аутентификации</h3>
            <button onClick={() => setAuthData(null)} className="close-btn">×</button>
          </div>
          <pre>{JSON.stringify(authData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
