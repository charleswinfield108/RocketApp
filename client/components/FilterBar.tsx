import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface FilterBarProps {
  onRatingChange: (rating: number | null) => void;
  onPriceChange: (price: number | null) => void;
  selectedRating: number | null;
  selectedPrice: number | null;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onRatingChange,
  onPriceChange,
  selectedRating,
  selectedPrice,
}) => {
  const [showRatingOptions, setShowRatingOptions] = useState(false);
  const [showPriceOptions, setShowPriceOptions] = useState(false);

  const ratingOptions = [
    { label: '-- Select --', value: null },
    { label: '★★★★ 4+', value: 4 },
    { label: '★★★ 3+', value: 3 },
    { label: '★★ 2+', value: 2 },
  ];

  const priceOptions = [
    { label: '-- Select --', value: null },
    { label: '$', value: 1 },
    { label: '$$', value: 2 },
    { label: '$$$', value: 3 },
  ];

  const getRatingLabel = (value: number | null) => {
    if (value === null) return '-- Select --';
    if (value === 4) return '★★★★ 4+';
    if (value === 3) return '★★★ 3+';
    if (value === 2) return '★★ 2+';
    return '-- Select --';
  };

  const getPriceLabel = (value: number | null) => {
    if (value === null) return '-- Select --';
    return '$'.repeat(value);
  };

  return (
    <View style={styles.container}>
      {/* Rating Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Rating</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowRatingOptions(!showRatingOptions)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {getRatingLabel(selectedRating)}
            </Text>
            <FontAwesomeIcon
              icon={faChevronDown as any}
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {showRatingOptions && (
            <View style={styles.optionsContainer}>
              {ratingOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => {
                    onRatingChange(option.value);
                    setShowRatingOptions(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === selectedRating && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Price Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Price</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowPriceOptions(!showPriceOptions)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {getPriceLabel(selectedPrice)}
            </Text>
            <FontAwesomeIcon
              icon={faChevronDown as any}
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {showPriceOptions && (
            <View style={styles.optionsContainer}>
              {priceOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => {
                    onPriceChange(option.value);
                    setShowPriceOptions(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === selectedPrice && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 100,
    overflow: 'visible',
  },
  filterContainer: {
    flex: 1,
    zIndex: 100,
    overflow: 'visible',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
    overflow: 'visible',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 13,
    color: '#666666',
  },
  optionTextActive: {
    color: '#DA583B',
    fontWeight: '600',
  },
});
