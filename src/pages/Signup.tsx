// frontend/src/pages/Signup.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sprout, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define form data type
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  region: string;
  farmSize: string;
  crops: string;
}

// Define validation error type
type FieldError = string | null;

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    region: '',
    farmSize: '',
    crops: ''
  });

  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    country: false,
    region: false,
    farmSize: false,
    crops: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const countries = [
    'Nigeria', 'Niger', 'Ghana', 'Kenya', 'Tanzania', 'Uganda', 'Ethiopia',
    'Senegal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire', 'Cameroon', 'South Africa'
  ];

  // Validation function
  const validateField = (name: keyof FormData, value: string): FieldError => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name cannot exceed 100 characters';
        return null;
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      case 'country':
        if (!value) return 'Country is required';
        return null;
      case 'region':
        if (!value) return 'State/Region is required';
        return null;
      case 'farmSize':
        if (value && (isNaN(Number(value)) || parseFloat(value) < 0))
          return 'Farm size must be 0 or more';
        return null;
      default:
        return null;
    }
  };

  const validateForm = (): { isValid: boolean; errors: Record<keyof FormData, FieldError> } => {
    const errors = {} as Record<keyof FormData, FieldError>;
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { ...touched };
    (Object.keys(allTouched) as Array<keyof FormData>).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const { isValid, errors } = validateForm();
    if (!isValid) {
      const firstError = Object.values(errors).find((err) => err !== null);
      setError(firstError || 'Please fix the errors above');
      return;
    }

    setError('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: {
          country: formData.country,
          region: formData.region,
          coordinates: { lat: 0, lng: 0 } // In production, geocode this
        },
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
        crops: formData.crops
          ? formData.crops
              .split(',')
              .map((crop) => crop.trim())
              .filter(Boolean)
          : undefined
      };

      const success = await signup(userData);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const getFieldError = (fieldName: keyof FormData): FieldError => {
    return touched[fieldName] ? validateField(fieldName, formData[fieldName]) : null;
  };

  const isFieldValid = (fieldName: keyof FormData): boolean => {
    return touched[fieldName] && !getFieldError(fieldName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Sprout className="h-10 w-10 text-green-600" />
            <span className="text-3xl font-bold text-gray-900">Nomagro</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            Sign in
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

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isFieldValid('name')
                      ? 'border-green-500'
                      : touched.name && getFieldError('name')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {isFieldValid('name') && (
                  <Check className="h-5 w-5 text-green-500 absolute right-3 top-2" />
                )}
              </div>
              {touched.name && getFieldError('name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isFieldValid('email')
                      ? 'border-green-500'
                      : touched.email && getFieldError('email')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {isFieldValid('email') && (
                  <Check className="h-5 w-5 text-green-500 absolute right-3 top-2" />
                )}
              </div>
              {touched.email && getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10 ${
                    isFieldValid('password')
                      ? 'border-green-500'
                      : touched.password && getFieldError('password')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
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
              {touched.password && getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10 ${
                    isFieldValid('confirmPassword')
                      ? 'border-green-500'
                      : touched.confirmPassword && getFieldError('confirmPassword')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && getFieldError('confirmPassword') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Country & Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isFieldValid('country')
                      ? 'border-green-500'
                      : touched.country && getFieldError('country')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {touched.country && getFieldError('country') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('country')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State/Region *
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isFieldValid('region')
                      ? 'border-green-500'
                      : touched.region && getFieldError('region')
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g. Ashanti"
                />
                {touched.region && getFieldError('region') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('region')}</p>
                )}
              </div>
            </div>

            {/* Farm Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Farm Size (hectares)
              </label>
              <input
                type="number"
                name="farmSize"
                step="0.1"
                value={formData.farmSize}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  isFieldValid('farmSize')
                    ? 'border-green-500'
                    : touched.farmSize && getFieldError('farmSize')
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="e.g. 2.5"
              />
              {touched.farmSize && getFieldError('farmSize') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('farmSize')}</p>
              )}
            </div>

            {/* Crops */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Main Crops (comma-separated)
              </label>
              <input
                type="text"
                name="crops"
                value={formData.crops}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. maize, cassava, cocoa"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}