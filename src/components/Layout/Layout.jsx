import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: "250px", display: "flex", flexDirection: "column" }}>
                <Header />
                <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
