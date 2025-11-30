import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const CatalogScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para cerrar sesión - VERSIÓN SIMPLIFICADA
  const handleSignOut = async () => {
  console.log('🔴 Botón presionado - versión mínima');
  
  try {
    console.log('🔄 Ejecutando signOut...');
    await signOut(auth);
    console.log('✅ Sesión cerrada exitosamente');
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    alert('Error: ' + error.message);
  }
};
  useEffect(() => {
    console.log('useEffect ejecutándose - fetchMovies');
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    console.log('fetchMovies iniciado');
    try {
      const moviesQuery = query(collection(db, 'movies'));
      const querySnapshot = await getDocs(moviesQuery);
      const moviesList = [];
      
      querySnapshot.forEach((doc) => {
        moviesList.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      
      console.log('Películas encontradas:', moviesList.length);
      setMovies(moviesList);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      console.log('fetchMovies completado');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const renderMovieItem = ({ item }) => {
    console.log('Renderizando película:', item.title);
    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => navigation.navigate('MovieDetail', { movie: item })}
      >
        <Image 
          source={{ 
            uri: item.image || 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Sin+Imagen'
          }} 
          style={styles.movieImage}
          resizeMode="cover"
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.movieYear}>{item.year}</Text>
          <Text style={styles.movieGenre} numberOfLines={1}>{item.genre}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Estado de carga
  if (loading) {
    console.log('Mostrando estado de carga...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  console.log('Renderizando pantalla principal con', movies.length, 'películas');
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo de Películas</Text>
        <TouchableOpacity 
          onPress={handleSignOut} 
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>{movies.length} películas disponibles</Text>
      
      {/* Lista de películas */}
      {movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={50} color="#666" />
          <Text style={styles.emptyText}>No hay películas en el catálogo</Text>
          <Text style={styles.emptySubtext}>
            Ve a la pestaña de Administración para agregar la primera película
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e50914']}
              tintColor="#e50914"
            />
          }
        />
      )}
    </View>
  );
};

// Estilos (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e50914',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  movieCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  movieImage: {
    width: '100%',
    height: 200,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movieYear: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  movieGenre: {
    color: '#ccc',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CatalogScreen;