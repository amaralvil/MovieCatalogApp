import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

const MovieDetailScreen = ({ route }) => {
  const { movie } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: movie.image }} 
        style={styles.movieImage}
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{movie.title}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Año:</Text>
          <Text style={styles.value}>{movie.year}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Director:</Text>
          <Text style={styles.value}>{movie.director}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Género:</Text>
          <Text style={styles.value}>{movie.genre}</Text>
        </View>
        
        <View style={styles.synopsisContainer}>
          <Text style={styles.label}>Sinopsis:</Text>
          <Text style={styles.synopsis}>{movie.synopsis}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  movieImage: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e50914',
    width: 100,
  },
  value: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  synopsisContainer: {
    marginTop: 10,
  },
  synopsis: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginTop: 5,
    textAlign: 'justify',
  },
});

export default MovieDetailScreen;