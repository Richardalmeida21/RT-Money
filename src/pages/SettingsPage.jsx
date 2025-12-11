import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout/Layout";
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Camera, Lock, User as UserIcon, Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

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

    const [imgError, setImgError] = useState(false);

    // Reset error when photoURL changes
    useEffect(() => {
        setImgError(false);
    }, [photoURL]);

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File too large (max 5MB)"); // Basic alert, could be translated but less critical
            return;
        }

        setLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = async () => {
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

                    const base64String = canvas.toDataURL('image/jpeg', 0.7);

                    await setDoc(doc(db, "users", user.uid), {
                        photoBase64: base64String
                    }, { merge: true });

                    setPhotoURL(base64String);
                    setMessage({ type: "success", text: t('photoSaved') });
                    setLoading(false);
                };
            };
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: t('photoError') });
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
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
                setMessage({ type: "success", text: t('profileUpdated') });
            }

            if (newPassword) {
                if (!currentPassword) throw new Error(t('currentPasswordRequired'));
                if (newPassword !== confirmPassword) throw new Error(t('passwordsDoNotMatch'));
                if (newPassword.length < 6) throw new Error(t('passwordTooShort'));

                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);

                setMessage({ type: "success", text: t('passwordChanged') });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: error.message || t('errorUpdating') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "2rem" }}>{t('settings')}</h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>

                {/* Left Column: Personal Information */}
                <div style={{ flex: "1", minWidth: "280px", background: "var(--surface)", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <UserIcon size={20} /> {t('personalInfo')}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
                        <div style={{ position: "relative", width: "100px", height: "100px" }}>




                            {photoURL && !imgError ? (
                                <img
                                    src={photoURL}
                                    alt="Profile"
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--background)" }}
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <UserIcon size={48} color="#aaa" />
                                </div>
                            )}
                            <label style={{
                                position: "absolute", bottom: "0", right: "0",
                                background: "var(--primary)", color: "white",
                                borderRadius: "50%", cursor: "pointer",
                                width: "32px", height: "32px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}>
                                <Camera size={16} />
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                            </label>
                        </div>
                        <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{user?.email}</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>{t('displayName')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                            />
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                                <Lock size={16} /> {t('changePassword')}
                            </h3>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                <input
                                    type="password"
                                    placeholder={t('currentPassword')}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                                />
                                <input
                                    type="password"
                                    placeholder={t('newPassword')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                                    disabled={!currentPassword}
                                />
                                <input
                                    type="password"
                                    placeholder={t('confirmNewPassword')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                                    disabled={!newPassword}
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div style={{
                                padding: "0.8rem", borderRadius: "8px",
                                background: message.type === "error" ? "var(--error)" : "var(--primary)",
                                color: "white", fontSize: "0.9rem", textAlign: "center", opacity: 0.9
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
                            {loading ? `${t('save')}...` : t('saveChanges')}
                        </button>
                    </form>
                </div>

                {/* Right Column: Preferences */}
                <div style={{ flex: "1", minWidth: "280px", background: "var(--surface)", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow)", height: "fit-content" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Monitor size={20} /> {t('preferences')}
                    </h2>

                    <div style={{ display: "grid", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>{t('language')}</label>
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                            >
                                <option value="pt">🇧🇷 Português</option>
                                <option value="en">🇺🇸 English</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>{t('theme')}</label>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    onClick={() => toggleTheme('light')}
                                    style={{
                                        flex: 1, padding: "0.8rem", borderRadius: "8px",
                                        border: theme === 'light' ? "2px solid var(--primary)" : "1px solid var(--border)",
                                        background: theme === 'light' ? "var(--primary-light)" : "var(--background)",
                                        color: theme === 'light' ? "white" : "var(--text-primary)",
                                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                    }}
                                >
                                    <Sun size={18} /> {t('light')}
                                </button>
                                <button
                                    onClick={() => toggleTheme('dark')}
                                    style={{
                                        flex: 1, padding: "0.8rem", borderRadius: "8px",
                                        border: theme === 'dark' ? "2px solid var(--primary)" : "1px solid var(--border)",
                                        background: theme === 'dark' ? "var(--primary-dark)" : "var(--background)",
                                        color: theme === 'dark' ? "white" : "var(--text-primary)",
                                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                    }}
                                >
                                    <Moon size={18} /> {t('dark')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
