import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

import WhatsNewModal from "./WhatsNewModal";

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1000);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
            <WhatsNewModal />
            <Sidebar isMobile={isMobile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{
                flex: 1,
                marginLeft: isMobile ? "0" : "250px",
                display: "flex",
                flexDirection: "column",
                width: isMobile ? "100%" : "calc(100% - 250px)",
                transition: "margin-left 0.3s ease"
            }}>
                <Header isMobile={isMobile} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main style={{ flex: 1, padding: isMobile ? "1rem" : "2rem", overflowY: "auto", overflowX: "hidden" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
