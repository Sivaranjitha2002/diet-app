import { useEffect, useState, useRef } from "react";

export function Login() {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current || isRedirecting) return;
        
        // Add a small delay to prevent rapid auth calls
        const timer = setTimeout(() => {
            hasRedirected.current = true;
            setIsRedirecting(true);
            window.location.href = window.origin + '/__catalyst/auth/login';
        }, 500);

        return () => clearTimeout(timer);
    }, [isRedirecting]);

    // Show loading state during redirect
    if (isRedirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return null;
}