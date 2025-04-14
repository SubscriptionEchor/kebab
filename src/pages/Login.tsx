import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
interface FormErrors {
  email?: string;
  password?: string;
}

function LoginShimmer() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Heading Shimmer */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-shimmer" />
            <div className="h-10 w-48 bg-gray-200 rounded animate-shimmer" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-shimmer" />
          </div>
          
          {/* Form Fields Shimmer */}
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-200 rounded animate-shimmer" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-200 rounded animate-shimmer" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-shimmer" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-shimmer" />
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-200 animate-shimmer" />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, userType, userId, savedCredentials } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = t('login.emailrequired');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('login.passwordrequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      // Pre-populate form with saved credentials if they exist
      if (savedCredentials) {
        setFormData(prev => ({
          ...prev,
          email: savedCredentials.email,
          password: savedCredentials.password,
          rememberMe: true
        }));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [savedCredentials]);

  // Validate form on data change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signIn(formData.email, formData.password, formData.rememberMe);

      if (!success) {
        return;
      }
      
      // Always redirect vendors to /vendor/restaurants
      const from = userType === 'VENDOR' 
        ? '/vendor/restaurants' 
        : '/dashboard';
      
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(t('login.signinerror'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoginShimmer />;
  }

  return (
    <div>
      <Header />
    <div className="mt-5 min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8 ">
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900">
              {t('login.appname')}
            </h1>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t('login.welcomeback')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('login.signinmessage')}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors`}
                  placeholder={t('login.enteryouremail')}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('login.password')}
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 pr-10 border ${
                      errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors`}
                    placeholder={t('login.enteryourpassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  {t('login.rememberme')}
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('login.signin')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://cdn.midjourney.com/6faeb637-362b-48ad-8540-4fe9124d8e46/0_0.png"
          alt={t('login.loginillustration')}
        />
      </div>
    </div>
    </div>
  );
}
