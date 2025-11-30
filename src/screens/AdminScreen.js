import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Alert,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

const AdminScreen = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    director: '',
    genre: '',
    synopsis: '',
    image: null
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'movies'));
      const moviesList = [];
      querySnapshot.forEach((doc) => {
        moviesList.push({ id: doc.id, ...doc.data() });
      });
      setMovies(moviesList);
    } catch (error) {
      console.error('Error fetching movies:', error);
      Alert.alert('Error', 'No se pudieron cargar las películas');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `movies/${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('No se pudo subir la imagen');
    }
  };

  // Función alternativa para usar URL directa en lugar de subir imagen
  const handleAddMovieWithURL = async () => {
    if (!formData.title || !formData.year || !formData.director || !formData.genre || !formData.synopsis) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Si no hay imagen, usar una imagen por defecto
    const imageUrls = {
  inception: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg',
  shawshank: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg',
  default: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Poster+No+Disponible'
}
    setLoading(true);
    try {
      await addDoc(collection(db, 'movies'), {
        title: formData.title,
        year: formData.year,
        director: formData.director,
        genre: formData.genre,
        synopsis: formData.synopsis,
        image: imageUrl,
        createdAt: new Date()
      });

      Alert.alert('Éxito', 'Película agregada correctamente');
      setFormData({
        title: '',
        year: '',
        director: '',
        genre: '',
        synopsis: '',
        image: null
      });
      fetchMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      Alert.alert('Error', 'No se pudo agregar la película: ' + error.message);
    }
    setLoading(false);
  };

  // Función para subir imagen y luego agregar película
  const handleAddMovieWithImageUpload = async () => {
    if (!formData.title || !formData.year || !formData.director || !formData.genre || !formData.synopsis || !formData.image) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(formData.image);
      
      await addDoc(collection(db, 'movies'), {
        title: formData.title,
        year: formData.year,
        director: formData.director,
        genre: formData.genre,
        synopsis: formData.synopsis,
        image: imageUrl,
        createdAt: new Date()
      });

      Alert.alert('Éxito', 'Película agregada correctamente');
      setFormData({
        title: '',
        year: '',
        director: '',
        genre: '',
        synopsis: '',
        image: null
      });
      fetchMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      Alert.alert('Error', 'No se pudo agregar la película: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteMovie = (movieId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta película?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'movies', movieId));
              fetchMovies();
              Alert.alert('Éxito', 'Película eliminada correctamente');
            } catch (error) {
              console.error('Error deleting movie:', error);
              Alert.alert('Error', 'No se pudo eliminar la película');
            }
          }
        }
      ]
    );
  };

  const renderMovieItem = ({ item }) => (
    <View style={styles.movieItem}>
      <Image source={{ uri: item.image }} style={styles.movieThumbnail} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.movieDetails}>{item.year} • {item.genre}</Text>
        <Text style={styles.movieDirector} numberOfLines={1}>{item.director}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteMovie(item.id)}
      >
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Administración de Películas</Text>
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Agregar Nueva Película</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Título de la película"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Año de lanzamiento"
          placeholderTextColor="#999"
          value={formData.year}
          onChangeText={(text) => setFormData({ ...formData, year: text })}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Director"
          placeholderTextColor="#999"
          value={formData.director}
          onChangeText={(text) => setFormData({ ...formData, director: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Género (ej: Acción, Drama, Comedia)"
          placeholderTextColor="#999"
          value={formData.genre}
          onChangeText={(text) => setFormData({ ...formData, genre: text })}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Sinopsis de la película"
          placeholderTextColor="#999"
          value={formData.synopsis}
          onChangeText={(text) => setFormData({ ...formData, synopsis: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>
              {formData.image ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
            </Text>
          </TouchableOpacity>
          
          {formData.image && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>Vista previa:</Text>
              <Image source={{ uri: formData.image }} style={styles.previewImage} />
            </View>
          )}
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.buttonDisabled]}
            onPress={handleAddMovieWithURL}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addButtonText}>Agregar Película</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            {formData.image 
              ? 'La imagen se guardará como URL. Para subir archivos, actualiza Firebase a plan Blaze.'
              : 'Se usará imagen por defecto. Puedes seleccionar una imagen desde tu galería.'
            }
          </Text>
        </View>
      </ScrollView>

      <View style={styles.moviesListContainer}>
        <Text style={styles.subHeader}>
          Películas en Catálogo ({movies.length})
        </Text>
        
        {movies.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={50} color="#666" />
            <Text style={styles.emptyStateText}>No hay películas en el catálogo</Text>
            <Text style={styles.emptyStateSubtext}>
              Agrega tu primera película usando el formulario superior
            </Text>
          </View>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id}
            style={styles.moviesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  formContainer: {
    maxHeight: '50%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  previewText: {
    color: '#fff',
    marginBottom: 5,
    fontSize: 14,
  },
  previewImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  buttonGroup: {
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#e50914',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
  moviesListContainer: {
    flex: 1,
  },
  moviesList: {
    flex: 1,
  },
  movieItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  movieThumbnail: {
    width: 50,
    height: 75,
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movieDetails: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  movieDirector: {
    color: '#ccc',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#e50914',
    padding: 8,
    borderRadius: 4,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default AdminScreen;