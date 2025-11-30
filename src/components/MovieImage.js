// src/components/MovieImage.js
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MovieImage = ({ source, style }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !source?.uri) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="image-outline" size={40} color="#666" />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Ionicons name="image" size={24} color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});

export default MovieImage;