import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Wine } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-50">
      <div className="text-center">
        <Wine size={64} className="text-wine-700 mx-auto mb-6" />
        <h1 className="text-6xl font-serif font-bold text-wine-800 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" size="lg">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;