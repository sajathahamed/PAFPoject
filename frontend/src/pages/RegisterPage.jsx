import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Dedicated registration page.
 */
const RegisterPage = () => {
    const { isAuthenticated, loading, error, register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [localError, setLocalError] = useState(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !loading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, loading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        try {
            await register(formData.email, formData.password, formData.name);
            navigate('/dashboard');
        } catch (err) {
            // Error handled by AuthContext
        }
    };

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
                <h1 className="login-title">Create Account</h1>
                <p className="login-subtitle">Join Smart Campus</p>

                {(error || localError) && (
                    <div className="alert alert-error mb-2">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-1">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group mb-1">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="form-group mb-1">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Min 6 characters"
                            minLength={6}
                        />
                    </div>

                    <div className="form-group mb-2">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary mb-2" style={{ width: '100%' }}>
                        Register
                    </button>
                </form>

                <div className="text-center">
                    <p style={{ fontSize: '14px' }}>
                        Already have an account? <Link to="/login" className="btn-link">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
