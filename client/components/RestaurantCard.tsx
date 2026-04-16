import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getStars, getPriceDisplay, getInitials } from '@/utils/formatters';

interface RestaurantCardProps {
  id: number | string;
  name: string;
  rating: number;
  priceRange: number;
  image?: string | number; // Can be URL string or require() import
  onPress?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  rating,
  priceRange,
  image,
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      const restaurantId = String(id);
      router.push(`/(tabs)/(restaurant)/${restaurantId}`);
    }
  };

  // Get a consistent color based on ID
  const getPlaceholderColor = () => {
    const colors = ['#DA583B', '#609475', '#222126', '#851919', '#F0CB67', '#DA583B'];
    return colors[(id as number) % colors.length];
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Restaurant Image */}
      {image ? (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: getPlaceholderColor() }]}>
          <Text style={styles.placeholderText}>{getInitials(name)}</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.content}>
        {/* Restaurant Name + Price */}
        <Text style={styles.name} numberOfLines={2}>
          {name} ({getPriceDisplay(priceRange)})
        </Text>

        {/* Stars */}
        <Text style={styles.rating}>
          {getStars(rating)}
        </Text>
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  rating: {
    fontSize: 12,
    color: '#F0CB67',
    fontWeight: '600',
    marginTop: 4,
  },
});
