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
            localStorage.setItem('pwaInstalled', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if already in standalone mode OR if previously installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const storedInstalled = localStorage.getItem('pwaInstalled') === 'true';

        if (isStandalone || storedInstalled) {
            setIsInstalled(true);
        } else {
            // Try to detect via API (Chrome 80+)
            if ('getInstalledRelatedApps' in navigator) {
                navigator.getInstalledRelatedApps().then((relatedApps) => {
                    if (relatedApps.length > 0) {
                        console.log('App detected as installed via API');
                        setIsInstalled(true);
                        localStorage.setItem('pwaInstalled', 'true');
                    }
                }).catch(err => console.log('Error checking installed apps:', err));
            }
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

        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    const resetInstallation = () => {
        localStorage.removeItem('pwaInstalled');
        setIsInstalled(false);
    };

    const confirmInstallation = () => {
        localStorage.setItem('pwaInstalled', 'true');
        setIsInstalled(true);
    };

    return (
        <InstallationContext.Provider value={{ installPrompt, promptInstall, isInstalled, resetInstallation, confirmInstallation }}>
            {children}
        </InstallationContext.Provider>
    );
}
