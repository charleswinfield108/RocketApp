import React, { useState, useEffect } from 'react';
import { OswaldFonts } from '@/constants/theme';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { restaurantsAPI } from '@/services/api';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterBar } from '@/components/FilterBar';
import { Header } from '@/components/Header';

const RESTAURANT_IMAGES = [
  require('@/assets/images/Restaurants/cuisinePizza.jpg'),
  require('@/assets/images/Restaurants/cuisineJapanese.jpg'),
  require('@/assets/images/Restaurants/cuisinePasta.jpg'),
  require('@/assets/images/Restaurants/cuisineGreek.jpg'),
  require('@/assets/images/Restaurants/cuisineSoutheast.jpg'),
  require('@/assets/images/Restaurants/cuisineViet.jpg'),
];

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  price_range: number;
  imageUrl?: string;
  description?: string;
}

export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurants from API on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantsAPI.getAll();
      // API wraps response in { message, data }
      const data = response.data.data || [];
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = restaurants;

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((r) => r.rating >= selectedRating);
    }

    // Filter by price
    if (selectedPrice !== null) {
      filtered = filtered.filter((r) => r.price_range === selectedPrice);
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
    fetchRestaurants();
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
      <Header />

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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              id={item.id}
              name={item.name}
              rating={item.rating}
              priceRange={item.price_range}
              image={RESTAURANT_IMAGES[item.id % RESTAURANT_IMAGES.length]}
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
    overflow: 'visible',
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
    fontFamily: OswaldFonts.bold,
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
