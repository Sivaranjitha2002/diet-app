import { useEffect } from "react";

export function Login() {
    useEffect(() => {
        window.location.href = window.origin + '/__catalyst/auth/login';
    }, []);
    return null;
}