import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ExternalDashboard from './pages/external/Dashboard';
import CartHistory from './pages/external/CartHistory';
import QuotationList from './pages/external/QuotationList';
import QuotationDetail from './pages/external/QuotationDetail';
import SalesDashboard from './pages/sales/Dashboard';
import CartReview from './pages/sales/CartReview';
import SourcingDashboard from './pages/sourcing/Dashboard';
import AddManufacturerSKU from './pages/sourcing/AddManufacturerSKU';
import EditManufacturerSKU from './pages/sourcing/EditManufacturerSKU';
import AdminDashboard from './pages/admin/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Role-based redirect
const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'External':
            return <Navigate to="/dashboard" replace />;
        case 'Sales':
            return <Navigate to="/sales/dashboard" replace />;
        case 'Sourcing':
            return <Navigate to="/sourcing/dashboard" replace />;
        case 'Admin':
            return <Navigate to="/admin/dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* External User Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['External']}>
                        <ExternalDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cart-history"
                element={
                    <ProtectedRoute allowedRoles={['External']}>
                        <CartHistory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/quotations"
                element={
                    <ProtectedRoute allowedRoles={['External']}>
                        <QuotationList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/quotations/:id"
                element={
                    <ProtectedRoute allowedRoles={['External']}>
                        <QuotationDetail />
                    </ProtectedRoute>
                }
            />

            {/* Sales User Routes */}
            <Route
                path="/sales/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Sales', 'Admin']}>
                        <SalesDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sales/cart-review/:cartId"
                element={
                    <ProtectedRoute allowedRoles={['Sales', 'Admin']}>
                        <CartReview />
                    </ProtectedRoute>
                }
            />

            {/* Sourcing User Routes */}
            <Route
                path="/sourcing/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Sourcing', 'Admin']}>
                        <SourcingDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sourcing/manufacturers"
                element={<Navigate to="/sourcing/dashboard?tab=manufacturers" replace />}
            />
            <Route
                path="/sourcing/manufacturers/add"
                element={
                    <ProtectedRoute allowedRoles={['Sourcing', 'Admin']}>
                        <AddManufacturerSKU />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sourcing/manufacturers/edit/:id"
                element={
                    <ProtectedRoute allowedRoles={['Sourcing', 'Admin']}>
                        <EditManufacturerSKU />
                    </ProtectedRoute>
                }
            />

            {/* Admin User Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
