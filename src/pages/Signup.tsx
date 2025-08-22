// nomagro-site/src/pages/Signup.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sprout, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  age: string;
  preferredLanguage: string;
  country: string;
  region: string;
  farmSize: string;
  crops: string;
}

type FieldError = string | null;

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    preferredLanguage: '',
    country: '',
    region: '',
    farmSize: '',
    crops: ''
  });

  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    age: false,
    preferredLanguage: false,
    country: false,
    region: false,
    farmSize: false,
    crops: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const countries = [
    'Nigeria', 'Niger', 'Ghana', 'Kenya', 'Tanzania', 'Uganda', 'Ethiopia',
    'Senegal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire', 'Cameroon', 'South Africa'
  ];

  const languages = ['English', 'Hausa', 'Igbo', 'Yoruba', 'Pidgin'];

  const validateField = (name: keyof FormData, value: string): FieldError => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      case 'email':
        if (!value && !formData.phone) return 'Email or phone number is required';
        if (value && !/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return null;
      case 'phone':
        if (!value && !formData.email) return 'Phone or email is required';
        if (value && !/^\+?[0-9]{7,15}$/.test(value)) return 'Phone number is invalid';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      case 'age':
        if (!value) return 'Age is required';
        if (isNaN(Number(value)) || Number(value) <= 0) return 'Age must be a positive number';
        return null;
      case 'preferredLanguage':
        if (!value) return 'Preferred language is required';
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

    // validate all fields
    const errors: Record<keyof FormData, FieldError> = {} as any;
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = Object.values(errors).find(Boolean);
      setError(firstError || 'Please fix the errors above');
      return;
    }

    setError('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        age: Number(formData.age),
        preferredLanguage: formData.preferredLanguage,
        location: {
          country: formData.country,
          region: formData.region,
          coordinates: { lat: 0, lng: 0 } // stubbed for now
        },
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
        crops: formData.crops
          ? formData.crops.split(',').map((c) => c.trim()).filter(Boolean)
          : undefined
      };

      const success = await signup(userData);
      if (success) navigate('/dashboard');
      else setError('Failed to create account. Please try again.');
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  const getFieldError = (f: keyof FormData): FieldError =>
    touched[f] ? validateField(f, formData[f]) : null;

  const isFieldValid = (f: keyof FormData): boolean => touched[f] && !getFieldError(f);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Sprout className="h-10 w-10 text-green-600" />
          <span className="text-3xl font-bold text-gray-900 ml-2">Nomagro</span>
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
                  <p className="ml-3 text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              />
              {touched.name && getFieldError('name') && (
                <p className="text-sm text-red-600">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              />
              {touched.email && getFieldError('email') && (
                <p className="text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="+2348012345678"
              />
              {touched.phone && getFieldError('phone') && (
                <p className="text-sm text-red-600">{getFieldError('phone')}</p>
              )}
              <p className="text-xs text-gray-500">Use either email or phone to sign up.</p>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              />
              {touched.age && getFieldError('age') && (
                <p className="text-sm text-red-600">{getFieldError('age')}</p>
              )}
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Language *</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              {touched.preferredLanguage && getFieldError('preferredLanguage') && (
                <p className="text-sm text-red-600">{getFieldError('preferredLanguage')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full border rounded-md px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
              </div>
              {touched.password && getFieldError('password') && (
                <p className="text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full border rounded-md px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
              </div>
              {touched.confirmPassword && getFieldError('confirmPassword') && (
                <p className="text-sm text-red-600">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Country, Region, Farm Size, Crops – same structure as before */}
            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white rounded-md py-2 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
