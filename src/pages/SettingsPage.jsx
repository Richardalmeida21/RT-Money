import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Layout from "../components/Layout/Layout";
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Camera, Lock, Globe, User as UserIcon, LogOut } from "lucide-react";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    // Profile State
    const [displayName, setDisplayName] = useState("");
    const [photoURL, setPhotoURL] = useState("");

    // Sync state with user data when it becomes available
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhotoURL(user.photoURL || "");
        }
    }, [user]);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            alert("A foto deve ter no máximo 5MB.");
            return;
        }

        setLoading(true);
        console.log("Processing image...", file.name);

        try {
            // 1. Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = async () => {
                    // 2. Resize Image (Max 300x300 for avatar)
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 3. Get compressed Base64
                    const base64String = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
                    console.log("Compressed size:", base64String.length, "bytes");

                    // 4. Save to Firestore (Not Storage!)
                    // We save to 'users' collection, document = user.uid
                    await setDoc(doc(db, "users", user.uid), {
                        photoBase64: base64String
                    }, { merge: true });

                    // Update local state immediately for feedback
                    setPhotoURL(base64String);
                    setMessage({ type: "success", text: "Foto salva no banco de dados!" });
                    setLoading(false);
                };
            };

            reader.onerror = (error) => {
                console.error("File reading error:", error);
                setMessage({ type: "error", text: "Erro ao ler arquivo." });
                setLoading(false);
            };

        } catch (error) {
            console.error("Error saving photo:", error);
            setMessage({ type: "error", text: "Erro ao salvar foto." });
            setLoading(false);
        } finally {
            e.target.value = null;
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            // Update Display Name
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
                setMessage({ type: "success", text: "Nome atualizado!" });
            }

            // Update Password
            if (newPassword) {
                if (!currentPassword) {
                    throw new Error("Por favor, digite sua senha atual para continuar.");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error("A nova senha e a confirmação não conferem.");
                }
                if (newPassword.length < 6) {
                    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
                }

                // Re-authenticate user
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);

                // Update Password
                await updatePassword(user, newPassword);
                setMessage({ type: "success", text: "Senha alterada com sucesso!" });

                // Clear fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error("Update error:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setMessage({ type: "error", text: "Senha atual incorreta." });
            } else {
                setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "2rem" }}>{t('settings')}</h1>

            <div style={{ display: "grid", gap: "2rem", width: "100%" }}>

                {/* Profile Card */}
                <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <UserIcon size={20} /> Perfil
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
                        <div style={{ position: "relative", width: "100px", height: "100px" }}>
                            {photoURL ? (
                                <img
                                    src={photoURL}
                                    alt="Profile"
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #f3f3f3" }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #f3f3f3",
                                    display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", color: "#aaa"
                                }}>
                                    <UserIcon size={48} />
                                </div>
                            )}

                            <label style={{
                                position: "absolute", bottom: "0", right: "0",
                                background: "var(--primary)", color: "white",
                                borderRadius: "50%", padding: "8px", cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}>
                                <Camera size={16} />
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                            </label>
                        </div>
                        <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>{user?.email}</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px", width: "100%", margin: "0 auto" }}>
                        {/* Hidden inputs to trick browser autofill */}
                        <div style={{ display: "none" }}>
                            <input type="text" autoComplete="username" />
                            <input type="password" autoComplete="new-password" />
                        </div>

                        <div style={{ width: "100%" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Nome de Exibição</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                                autoComplete="off"
                            />
                        </div>

                        <div style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem", marginTop: "1rem", width: "100%" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#666" }}>
                                <Lock size={16} /> Alterar Senha
                            </h3>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                <input
                                    type="password"
                                    placeholder="Senha Atual (Necessária para alterar)"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                                    autoComplete="off"
                                    readOnly
                                    onFocus={(e) => e.target.removeAttribute('readonly')}
                                />
                                <input
                                    type="password"
                                    placeholder="Nova Senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                                    disabled={!currentPassword}
                                    autoComplete="new-password"
                                    readOnly={!currentPassword}
                                    onFocus={(e) => { if (currentPassword) e.target.removeAttribute('readonly'); }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar Nova Senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                                    disabled={!newPassword}
                                    autoComplete="new-password"
                                    readOnly={!newPassword}
                                    onFocus={(e) => { if (newPassword) e.target.removeAttribute('readonly'); }}
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div style={{
                                padding: "0.8rem", borderRadius: "8px",
                                background: message.type === "error" ? "#FED7D7" : "#C6F6D5",
                                color: message.type === "error" ? "#C53030" : "#2F855A",
                                fontSize: "0.9rem", textAlign: "center"
                            }}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: "1rem", padding: "1rem", background: "var(--primary)", color: "white",
                                border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </form>
                </div>

                {/* Preferences Card */}
                <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Globe size={20} /> Preferências
                    </h2>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "600", color: "#4A5568" }}>Idioma do Sistema</span>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        >
                            <option value="pt">🇧🇷 Português</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={logout}
                    style={{
                        background: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7",
                        padding: "1rem", borderRadius: "12px", fontWeight: "bold", cursor: "pointer",
                        display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <LogOut size={20} /> Sair do Sistema
                </button>

            </div>
        </Layout>
    );
}
