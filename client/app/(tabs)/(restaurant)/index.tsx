import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterBar } from '@/components/FilterBar';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceRange: number;
  image: any;
  description?: string;
}

// Mock restaurant data with images from assets
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-001',
    name: 'Pizza Palace',
    rating: 4.5,
    priceRange: 2,
    image: require('@/assets/images/Restaurants/cuisinePizza.jpg'),
    description: 'Italian pizza & pasta',
  },
  {
    id: 'rest-002',
    name: 'Greek Taverna',
    rating: 4.3,
    priceRange: 2,
    image: require('@/assets/images/Restaurants/cuisineGreek.jpg'),
    description: 'Authentic Greek cuisine',
  },
  {
    id: 'rest-003',
    name: 'Japanese Delights',
    rating: 4.8,
    priceRange: 3,
    image: require('@/assets/images/Restaurants/cuisineJapanese.jpg'),
    description: 'Sushi & ramen',
  },
  {
    id: 'rest-004',
    name: 'Pasta Heaven',
    rating: 4.6,
    priceRange: 2,
    image: require('@/assets/images/Restaurants/cuisinePasta.jpg'),
    description: 'Fresh Italian pasta',
  },
  {
    id: 'rest-005',
    name: 'Southeast Asian Fusion',
    rating: 4.2,
    priceRange: 2,
    image: require('@/assets/images/Restaurants/cuisineSoutheast.jpg'),
    description: 'Thai & Vietnamese',
  },
  {
    id: 'rest-006',
    name: 'Vietnamese Pho House',
    rating: 4.4,
    priceRange: 1,
    image: require('@/assets/images/Restaurants/cuisineViet.jpg'),
    description: 'Pho & Vietnamese classics',
  },
];

export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    MOCK_RESTAURANTS
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = restaurants;

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((r) => r.rating >= selectedRating);
    }

    // Filter by price
    if (selectedPrice !== null) {
      filtered = filtered.filter((r) => r.priceRange === selectedPrice);
    }

    setFilteredRestaurants(filtered);
  }, [selectedRating, selectedPrice, restaurants]);

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
  };

  const handlePriceChange = (price: number | null) => {
    setSelectedPrice(price);
  };

  const handleRetry = () => {
    setError(null);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <FilterBar
        onRatingChange={handleRatingChange}
        onPriceChange={handlePriceChange}
        selectedRating={selectedRating}
        selectedPrice={selectedPrice}
      />

      {/* Restaurants Title */}
      <Text style={styles.sectionTitle}>NEARBY RESTAURANTS</Text>

      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              id={item.id}
              name={item.name}
              rating={item.rating}
              priceRange={item.priceRange}
              image={item.image}
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants match your filters</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSelectedRating(null);
              setSelectedPrice(null);
            }}
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#851919',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222126',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
