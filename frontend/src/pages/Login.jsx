import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sahte demo kullanıcı (istediğin kadar ekleyebilirsin)
    const demoUsers = [
      { email: "admin@ekos.com", password: "123456", name: "Admin" },
      { email: "user@ekos.com", password: "demo", name: "Kullanıcı" },
      { email: "test", password: "test", name: "Test Kullanıcısı" }
    ];

    // 1 saniye bekletip gerçekçi olsun
    setTimeout(() => {
      const user = demoUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Sahte token oluştur (gerçek JWT gibi görünüyor)
        const fakeToken = "demo-jwt-token-123456789-ekos-project";
        localStorage.setItem("token", fakeToken);
        localStorage.setItem("user", JSON.stringify({ email, name: user.name }));

        alert("Hoş geldin " + user.name + "!");
        navigate("/dashboard");
      } else {
        alert("Hatalı email veya şifre!\n\nİpucu: admin@ekos.com / 123456");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center", fontFamily: "Arial" }}>
      <h1>EKOS</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
        <input
          type="text"
          placeholder="E-posta veya kullanıcı adı"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "12px", fontSize: "16px" }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "12px", fontSize: "16px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px",
            fontSize: "18px",
            background: loading ? "#999" : "#2e8b57",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#555" }}>
        <strong>Demo Giriş Bilgileri:</strong><br/>
        • admin@ekos.com → 123456<br/>
        • user@ekos.com → demo<br/>
        • test → test
      </div>
    </div>
  );
}

export default Login;
