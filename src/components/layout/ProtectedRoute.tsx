import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

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

    const { user } = useAuth();
    const roles = user?.roles || (user?.role ? [user.role] : []);
    const isAuthorizedAdmin = roles.some(r => ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(r.toUpperCase()));

    if (!isAuthorizedAdmin) {
        // Log out or redirect to an unauthorized page. Here we redirect to login assuming logout clears state.
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
