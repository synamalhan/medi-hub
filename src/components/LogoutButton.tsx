import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';

export function LogoutButton() {
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function in authStore will handle the redirect
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Sign Out
    </Button>
  );
} 