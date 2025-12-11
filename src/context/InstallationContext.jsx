import { createContext, useContext, useState, useEffect } from "react";

const InstallationContext = createContext();

export function useInstallation() {
    return useContext(InstallationContext);
}

export function InstallationProvider({ children }) {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67+ from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
            console.log("Installation Prompt Captured");
        };

        const handleAppInstalled = () => {
            console.log("App was installed");
            setInstallPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setInstallPrompt(null);
    };

    return (
        <InstallationContext.Provider value={{ installPrompt, promptInstall, isInstalled }}>
            {children}
        </InstallationContext.Provider>
    );
}
