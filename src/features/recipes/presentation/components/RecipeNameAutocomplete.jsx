import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Search, Plus, ChefHat, Check, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../../core/theme/theme';
import {
  normalizeRecipeName,
  searchRecipeNames,
  addCustomRecipeName
} from '../../services/recipeNameService';

export const RecipeNameAutocomplete = ({
  value,
  onChangeText,
  error,
  label = 'Recipe Name (English) *',
  placeholder = 'e.g. Kashmiri Dum Aloo',
  maxSuggestions = 6,
  onSelectExisting
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  
  const textInputRef = useRef(null);

  // Sync state if value prop changes (e.g. draft loads)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Load and filter suggestions (debounced slightly to keep keyboard fast)
  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      if (!isFocused || !query || query.trim() === '') {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const results = await searchRecipeNames(query);
        if (active) {
          setSuggestions(results.slice(0, maxSuggestions));
        }
      } catch (err) {
        console.error('Error fetching autocomplete suggestions', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 150);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [query, isFocused, maxSuggestions]);

  // Determine if typed name is an exact match in the current suggestions or master database
  const hasExactMatch = useMemo(() => {
    if (!query) return true;
    const normalizedQuery = normalizeRecipeName(query);
    if (!normalizedQuery) return true;

    return suggestions.some(
      (item) => normalizeRecipeName(item) === normalizedQuery
    );
  }, [query, suggestions]);

  const handleSelect = (item) => {
    onChangeText(item);
    setQuery(item);
    setShowDropdown(false);
    if (onSelectExisting) {
      onSelectExisting(item);
    }
    Keyboard.dismiss();
  };

  const handleAddNew = async () => {
    const normalized = normalizeRecipeName(query);
    if (!normalized) return;

    try {
      setLoading(true);
      const savedName = await addCustomRecipeName(normalized);
      onChangeText(savedName);
      setQuery(savedName);
      setShowDropdown(false);
      setAddedSuccess(true);
      
      // Auto-hide success check icon indicator after 2 seconds
      setTimeout(() => {
        setAddedSuccess(false);
      }, 2000);

      Keyboard.dismiss();
    } catch (err) {
      console.error('Failed to add custom recipe name', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChangeText('');
    setQuery('');
    setShowDropdown(false);
    textInputRef.current?.focus();
  };

  // Render suggested item with query character highlights
  const renderSuggestionItem = ({ item }) => {
    const text = item;
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSelect(text)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Select suggestion ${text}`}
        >
          <ChefHat size={16} color={COLORS.textMuted} style={styles.itemIcon} />
          <Text style={styles.suggestionText}>{text}</Text>
        </TouchableOpacity>
      );
    }

    // Split and bold matches
    // eslint-disable-next-line no-useless-escape
    const parts = text.split(new RegExp(`(${cleanQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelect(text)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Select suggestion ${text}`}
      >
        <ChefHat size={16} color={COLORS.textMuted} style={styles.itemIcon} />
        <Text style={styles.suggestionText} numberOfLines={1}>
          {parts.map((part, index) => {
            const isMatch = part.toLowerCase() === cleanQuery.toLowerCase();
            return (
              <Text
                key={index}
                style={isMatch ? styles.highlightText : styles.normalText}
              >
                {part}
              </Text>
            );
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isFocused && showDropdown && styles.activeZIndex]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          error && styles.errorInputContainer
        ]}
      >
        <Search size={18} color={isFocused ? COLORS.primary : COLORS.textMuted} style={styles.searchIcon} />
        
        <TextInput
          ref={textInputRef}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onChangeText(text);
            setShowDropdown(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted + '80'}
          style={styles.textInput}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => {
            // Slight timeout to let TouchableOpacity taps execute before closing dropdown
            setTimeout(() => {
              setIsFocused(false);
              setShowDropdown(false);
            }, 250);
          }}
          accessible={true}
          accessibilityLabel="Recipe Title Input"
          accessibilityHint="Type to search existing heritage dishes or add a custom one"
        />

        {loading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
        )}

        {addedSuccess && (
          <View style={styles.successBadge} accessibilityLabel="Added successfully">
            <Check size={16} color={COLORS.secondary} />
          </View>
        )}

        {query !== '' && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Clear text"
            accessibilityRole="button"
          >
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isFocused && showDropdown && (
        <View style={styles.dropdownContainer}>
          {suggestions.length === 0 && query.trim() !== '' && !loading && (
            <View style={styles.noResultContainer}>
              <Text style={styles.noResultText}>No matching recipe records found</Text>
            </View>
          )}

          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={renderSuggestionItem}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={true}
            style={styles.list}
            ListFooterComponent={
              !hasExactMatch && query.trim() !== '' ? (
                <TouchableOpacity
                  style={styles.addNewItem}
                  onPress={handleAddNew}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${query.trim()} as a new recipe`}
                >
                  <Plus size={16} color={COLORS.terracotta || '#A3441F'} style={styles.itemIcon} />
                  <Text style={styles.addNewText} numberOfLines={1}>
                    Add <Text style={styles.addNewName}>“{query.trim()}”</Text> as a new recipe
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  activeZIndex: {
    zIndex: 999,
  },
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.xs,
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF7F1',
    borderWidth: 1.2,
    borderColor: '#E7D8C5',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: SPACING.sm,
  },
  focusedInputContainer: {
    borderColor: COLORS.primary,
  },
  errorInputContainer: {
    borderColor: COLORS.error || '#D32F2F',
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  textInput: {
    flex: 1,
    ...FONTS.body,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  loader: {
    marginRight: 6,
  },
  successBadge: {
    marginRight: 6,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error || '#D32F2F',
    marginTop: SPACING.xs,
    paddingLeft: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radiusMd || 12,
    borderWidth: 1,
    borderColor: '#E7D8C5',
    ...SHADOWS.medium,
    maxHeight: 250,
    zIndex: 10000,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FAF5EE',
  },
  itemIcon: {
    marginRight: 10,
  },
  suggestionText: {
    ...FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  highlightText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  normalText: {
    fontWeight: '400',
    color: COLORS.text,
  },
  addNewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFF8F4',
    borderTopWidth: 1,
    borderTopColor: '#FFF0E6',
  },
  addNewText: {
    ...FONTS.bodyMedium,
    fontSize: 14.5,
    color: COLORS.terracotta || '#A3441F',
    flex: 1,
  },
  addNewName: {
    fontWeight: '600',
    fontStyle: 'italic',
  },
  noResultContainer: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  noResultText: {
    ...FONTS.caption,
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
});

export default RecipeNameAutocomplete;
