import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface RestaurantCardProps {
  id: string;
  name: string;
  rating: number;
  priceRange: number;
  image: any; // require() import
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  rating,
  priceRange,
  image,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/(restaurant)/[id]',
      params: { id },
    });
  };

  // Convert price range to dollar signs
  const getPriceDisplay = (price: number) => {
    return '$'.repeat(Math.min(price, 3)) || '$';
  };

  // Convert rating to star display
  const getStarDisplay = (rating: number) => {
    const stars = Math.floor(rating);
    return '★'.repeat(stars);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Restaurant Image */}
      <Image
        source={image}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Card Content */}
      <View style={styles.content}>
        {/* Restaurant Name */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Rating and Price */}
        <View style={styles.infoRow}>
          <Text style={styles.rating}>
            {getStarDisplay(rating)}
          </Text>
          <Text style={styles.price}>
            {getPriceDisplay(priceRange)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#F0CB67',
    fontWeight: '600',
  },
  price: {
    fontSize: 12,
    color: '#DA583B',
    fontWeight: '600',
  },
});
