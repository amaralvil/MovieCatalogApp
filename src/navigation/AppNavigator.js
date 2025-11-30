import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

// Importar pantallas
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CatalogScreen from '../screens/CatalogScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Catalog') {
          iconName = focused ? 'film' : 'film-outline';
        } else if (route.name === 'Admin') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#e50914',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
      },
      headerStyle: {
        backgroundColor: '#1a1a1a',
      },
      headerTintColor: '#fff',
    })}
  >
    <Tab.Screen 
      name="Catalog" 
      component={CatalogScreen}
      options={{ title: 'Catálogo' }}
    />
    <Tab.Screen 
      name="Admin" 
      component={AdminScreen}
      options={{ title: 'Administración' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={AppTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MovieDetail" 
      component={MovieDetailScreen}
      options={{ 
        title: 'Detalle de Película',
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // O un componente de carga
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;