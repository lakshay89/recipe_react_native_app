import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../services/AuthContext';

export const useNavigationGuard = (navigation) => {
  const { savingState, flushPendingSave } = useAuth();

  useEffect(() => {
    if (!navigation) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If saving locally or unsaved edits, flush them first
      if (savingState === 'SavingLocally' || savingState === 'Unsaved') {
        e.preventDefault();
        
        flushPendingSave()
          .then(() => {
            // Re-action navigation after flush succeeds
            navigation.dispatch(e.data.action);
          })
          .catch((err) => {
            // Warn only if local write fails
            Alert.alert(
              'Unsaved Changes',
              'We encountered an issue saving your progress. Discard changes and exit?',
              [
                { text: 'Keep Editing', style: 'cancel' },
                {
                  text: 'Discard & Exit',
                  style: 'destructive',
                  onPress: () => navigation.dispatch(e.data.action)
                }
              ]
            );
          });
      }
    });

    return unsubscribe;
  }, [navigation, savingState]);
};

export default useNavigationGuard;
