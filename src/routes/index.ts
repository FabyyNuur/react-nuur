import { type NavigateFunction, useNavigate, useRoutes } from "react-router-dom";
import routes from "./config";
import { useEffect } from "react";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
    interface Window {
        REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
    }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
    navigateResolver = resolve;
});

export function AppRoutes() {
    const element = useRoutes(routes);
    const navigate = useNavigate(); 
    useEffect(() => {
        window.REACT_APP_NAVIGATE = navigate;
        navigateResolver(window.REACT_APP_NAVIGATE);
    });
    return element;
}
