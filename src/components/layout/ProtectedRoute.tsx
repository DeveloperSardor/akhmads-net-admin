import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-app)", color: "var(--text-muted)" }}>
                Yuklanmoqda...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const roles = user?.roles || (user?.role ? [user.role] : []);
    const isAuthorizedAdmin = roles.some(r => ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(r.toUpperCase()));

    if (!isAuthorizedAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
