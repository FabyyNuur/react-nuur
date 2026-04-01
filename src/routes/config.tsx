import type { RouteObject } from "react-router-dom";
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = lazy(() => import("../pages/main-layout/page"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Activities = lazy(() => import("../pages/Activities"));
const Clients = lazy(() => import("../pages/Clients"));
const Ticketing = lazy(() => import("../pages/Ticketing"));
const Scanner = lazy(() => import("../pages/Scanner"));
const Treasury = lazy(() => import("../pages/Treasury"));
const Users = lazy(() => import("../pages/Users"));
const Login = lazy(() => import("../pages/Login"));
const ActivityDetails = lazy(() => import("../pages/ActivityDetails"));

// Composant pour protéger les routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const routes: RouteObject[] = [
    {
        path: "/",
        element: (
            <PrivateRoute>
                <MainLayout />
            </PrivateRoute>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "activities", element: <Activities /> },
            { path: "activities/:id", element: <ActivityDetails /> },
            { path: "clients", element: <Clients /> },
            { path: "ticketing", element: <Ticketing /> },
            { path: "scanner", element: <Scanner /> },
            { path: "treasury", element: <Treasury /> },
            { path: "users", element: <Users /> },
        ],
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "*",
        element: <Navigate to="/" />,
    },
];

export default routes;
