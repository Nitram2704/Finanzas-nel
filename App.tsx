import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Dashboard from './src/screens/Dashboard';
import History from './src/screens/History';
// import Settings from './src/screens/Settings'; // Removed
import TransactionForm from './src/components/TransactionForm';
import Sidebar from './src/components/Sidebar';
import { Theme } from './src/lib/theme';

import { syncTransactionToSheet } from './src/lib/data-service';

export default function App() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width > 768;

  const [currentScreen, setCurrentScreen] = useState<'dash' | 'budget' | 'history' | 'stats'>('dash');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense' | 'saving'>('expense');
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar recarga del Dashboard

  const handleOpenForm = (type: 'income' | 'expense' | 'saving') => {
    setFormType(type);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => setIsFormVisible(false);

  const handleSaveTransaction = async (data: any) => {
    console.log('Transaction process starting:', data);
    const success = await syncTransactionToSheet(data);
    if (success) {
      console.log('Successfully synced to Sheet');
      setRefreshKey(prev => prev + 1); // Disparar recarga
    } else {
      console.error('Failed to sync to Sheet');
    }
  };

  const handleNavigate = (screen: any) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dash':
      case 'budget':
        return (
          <Dashboard
            onAddPress={handleOpenForm}
            onNavigate={handleNavigate}
            currentScreen={currentScreen}
            refreshKey={refreshKey}
          />
        );
      case 'history':
        return <History onNavigate={handleNavigate} />;
      default:
        return (
          <Dashboard
            onAddPress={handleOpenForm}
            onNavigate={handleNavigate}
            currentScreen={currentScreen}
            refreshKey={refreshKey}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />

        {isWeb && (
          <Sidebar
            onNavigate={handleNavigate}
            currentScreen={currentScreen}
          />
        )}

        <View style={styles.content}>
          {renderScreen()}
        </View>

        <TransactionForm
          isVisible={isFormVisible}
          initialType={formType}
          onClose={handleCloseForm}
          onSave={handleSaveTransaction}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  }
});
