import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && !loading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">🏫</div>
                <h1 className="login-title">Registration Disabled</h1>
                <p className="login-subtitle">Please contact admin to create an account</p>

                <div className="alert alert-info mb-3" style={{ textAlign: 'center' }}>
                    Self-registration is not available. Contact your system administrator for access.
                </div>

                <div className="text-center">
                    <Link to="/login" className="btn btn-primary">
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;