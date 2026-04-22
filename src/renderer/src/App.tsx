import { useState } from "react";

function App() {
  const [authData, setAuthData] = useState<any>(null);
  const [status, setStatus] = useState<string>("Готов к работе");

  const handleLogin = async () => {
    try {
      setStatus("Открываю окно входа...");
      // @ts-ignore
      const data = await window.electronAPI.openMicrosoftLogin();

      setAuthData(data);
      setStatus("Вход выполнен успешно!");
      console.log("Данные от Microsoft:", data);
    } catch (err) {
      setStatus("Ошибка или вход отменен");
      console.error(err);
    }
  };
  const sayHello = async () => {
    const data = await window.electronAPI.hello("Ratmir");
    console.log(data);
  };

  return (
    <div
      style={{
        padding: "20px",
        color: "white",
        backgroundColor: "#171614",
        minHeight: "100vh",
      }}
    >
      <h1>
        Gerbarium Launcher <small>(React Edition)</small>
      </h1>
      <p>Статус: {status}</p>

      <button
        onClick={sayHello}
        style={{
          padding: "10px 20px",
          backgroundColor: "#00a4ef",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Войти через Microsoft
      </button>

      {authData && (
        <div style={{ marginTop: "20px", background: "#222", padding: "10px" }}>
          <h3>Получены данные (Code):</h3>
          <pre style={{ fontSize: "12px", color: "#0f0" }}>
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
