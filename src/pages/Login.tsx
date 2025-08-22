// nomagro-site/src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sprout, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState<string>(''); // ✅ email OR phone
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Validate identifier as email OR phone
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'identifier':
        if (!value) return 'Email or phone is required';
        if (value.includes('@')) {
          if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        } else {
          if (!/^\+?\d{7,15}$/.test(value)) return 'Phone number is invalid';
        }
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: 'identifier' | 'password') => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });

    const identifierError = validateField('identifier', identifier);
    const passwordError = validateField('password', password);

    if (identifierError || passwordError) {
      setError(identifierError || passwordError);
      return;
    }

    setError('');

    try {
      const success = await login(identifier, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please check and try again.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
      console.error('Login error:', err);
    }
  };

  const identifierError = touched.identifier && validateField('identifier', identifier);
  const passwordError = touched.password && validateField('password', password);
  const isIdentifierValid = touched.identifier && !identifierError;
  const isPasswordValid = touched.password && !passwordError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Sprout className="h-10 w-10 text-green-600" />
            <span className="text-3xl font-bold text-gray-900">Nomagro</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Phone</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onBlur={() => handleBlur('identifier')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isIdentifierValid
                      ? 'border-green-500'
                      : touched.identifier && identifierError
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your email or phone"
                />
                {isIdentifierValid && (
                  <Check className="h-5 w-5 text-green-500 absolute right-3 top-2" />
                )}
              </div>
              {touched.identifier && identifierError && (
                <p className="mt-1 text-sm text-red-600">{identifierError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10 ${
                    isPasswordValid
                      ? 'border-green-500'
                      : touched.password && passwordError
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
