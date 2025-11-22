import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '../components/Auth/AuthLayout';

/**
 * LoginPage - Clean, modern sign-in page
 */
function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue to PDF Genie"
    >
      <div className="w-full">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none w-full',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              headerBackLink: 'hidden',
              socialButtonsBlock: 'space-y-3',
              socialButtonsBlockButton: {
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                },
                '&:active': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                },
                '&:focus': {
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)',
                },
              },
              formButtonPrimary: {
                backgroundColor: '#10B981',
                '&:hover': {
                  backgroundColor: '#059669',
                },
                '&:active': {
                  backgroundColor: '#047857',
                },
              },
              formFieldInput: {
                backgroundColor: 'transparent',
                borderColor: 'rgba(203, 213, 225, 0.5)',
                '&:focus': {
                  borderColor: '#10B981',
                  boxShadow: '0 0 0 1px #10B981',
                },
                '&:hover': {
                  borderColor: 'rgba(203, 213, 225, 0.8)',
                },
              },
              formFieldLabel: {
                color: 'rgba(30, 41, 59, 0.9)',
                fontSize: '0.875rem',
                marginBottom: '0.25rem',
              },
              footerActionLink: {
                color: '#10B981',
                '&:hover': {
                  color: '#059669',
                },
              },
              dividerLine: {
                backgroundColor: 'rgba(203, 213, 225, 0.3)',
              },
              dividerText: {
                color: 'rgba(100, 116, 139, 0.8)',
                fontSize: '0.875rem',
              },
              footerActionText: {
                color: 'rgba(100, 116, 139, 0.8)',
                fontSize: '0.875rem',
              },
            },
            variables: {
              colorPrimary: '#10B981',
              colorText: 'rgba(15, 23, 42, 0.9)',
              colorTextSecondary: 'rgba(100, 116, 139, 0.8)',
              colorTextOnPrimaryBackground: '#ffffff',
              colorBackground: '#ffffff',
              colorInputBackground: 'transparent',
              colorInputText: 'rgba(15, 23, 42, 0.9)',
            },
          }}
        />
      </div>
    </AuthLayout>
  );
}

export default LoginPage;

