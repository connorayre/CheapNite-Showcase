import React, { useState } from 'react';
import { View, ScrollView, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';

const icons = {
  "For-You": require('../assets/Icons/For-You-Icon.png'), //https://icons8.com/icon/VkCeX4Qax9iH/i
  "CheapNite-Favs": require('../assets/Icons/CheapNite-Favourites-Icon.png'),
  "Pizza": require('../assets/Icons/Pizza-Icon.png'), //https://icons8.com/icon/8342/pizza
  "Fast-Food": require('../assets/Icons/Fast-Food-Icon.png'), //https://icons8.com/icon/WA3jNNBKhx2h/fast-food
  "Mexican": require('../assets/Icons/Mexican-Icon.png'), //https://icons8.com/icon/8467/taco
  "Happy-Hour": require('../assets/Icons/Happy-Hour-Icon.png'), //https:icons8.com/icon/3PVAMpXNuBRu/beers
  "Asian": require('../assets/Icons/Asian-Icon.png'), //https://icons8.com/icon/117027/salmon-sushi
  "Beer": require('../assets/Icons/Beer-Icon.png'), //https://icons8.com/icon/8383/beer
  "Wine": require('../assets/Icons/Wine-Icon.png'), //https://icons8.com/icon/35909/wine
  "Liquor": require('../assets/Icons/Liquor-Icon.png'), //https://icons8.com/icon/108422/whiskey
  "Patio": require('../assets/Icons/Patio-Icon.png'), //https://icons8.com/icon/sP9KITYUy52Z/patio
  "Other": require('../assets/Icons/Other-Icon.png'), //https://icons8.com/icon/61873/more
  "Salad": require('../assets/Icons/Healthy-Icon.png'), //https://icons8.com/icon/36916/healthy-food
  "Live-Music": require('../assets/Icons/Live-Music-Icon.png'), //https://icons8.com/icon/SsbicED9ubOc/concert
  "Trivia": require('../assets/Icons/Trivia-Icon.png'), //https://icons8.com/icon/25211/quiz
  "Karaoke": require('../assets/Icons/Karaoke-Icon.png'), //https://icons8.com/icon/KG6Flpzp7ixB/karaoke
  "BBQ": require('../assets/Icons/BBQ-Icon.png'), //https://icons8.com/icon/24290/weber
  "Sports": require('../assets/Icons/Sports-Icon.png'), //https://icons8.com/icon/sIE784BZgmJT/sports
  "BOGO": require('../assets/Icons/Bogo-Icon.png'), //https://icons8.com/icon/12424/one-free
  "Breakfast": require('../assets/Icons/Breakfast-Icon1.png'), //https://icons8.com/icon/HFlENWU94Al6/breakfast
  "Carribean": require('../assets/Icons/Carribean-ICon.png'), //https://icons8.com/icon/pDY8ig7vTyVM/fish-dish
  "Greek": require('../assets/Icons/Greek-Icon.png'), //https://icons8.com/icon/15938/olive
  "Specials": require('../assets/Icons/Other-Drink.png'), //https://icons8.com/icon/55916/guinness-beer
  "Indian": require('../assets/Icons/Indian-Icon.png'), //https://icons8.com/icon/xabZcnwPKQYW/curry
  "Italian": require('../assets/Icons/Italian-Icon.png'), //https://icons8.com/icon/xeeViW00CL1n/spaghetti
  "Delivery": require('../assets/Icons/Delivery-Icon.png'), //https://icons8.com/icon/8290/delivery
  "Wings": require('../assets/Icons/Wings-Icon.png'), //https://icons8.com/icon/osOCPfmaRZjJ/drumstick
  "Vegan": require('../assets/Icons/Vegan-Icon.png'), //https://icons8.com/icon/8445/vegan-food
  "Selected-For-You": require('../assets/Icons/Selected-For-You-Icon.png'),// https:icons8.com/icon/VkCeX4Qax9iH/i
  "Selected-CheapNite-Favs": require('../assets/Icons/Selected-CheapNite-Favourites-Icon.png'),
  "Selected-Happy-Hour": require('../assets/Icons/Selected-Happy-Hour-Icon.png'), //https:icons8.com/icon/3PVAMpXNuBRu/beers
  "Selected-Pizza": require('../assets/Icons/Selected-Pizza-Icon.png'), //https://icons8.com/icon/8342/pizza
  "Selected-Fast-Food": require('../assets/Icons/Selected-Fast-Food-Icon.png'), ////https://icons8.com/icon/WA3jNNBKhx2h/fast-food
  "Selected-Mexican": require('../assets/Icons/Selected-Mexican-Icon.png'), //https://icons8.com/icon/8467/taco
  "Selected-Italian": require('../assets/Icons/Selected-Italian-Icon.png'), //https://icons8.com/icon/xeeViW00CL1n/spaghetti
  "Selected-Asian": require('../assets/Icons/Selected-Asian-Icon.png'), //https://icons8.com/icon/117027/salmon-sushi
  "Selected-Beer": require('../assets/Icons/Selected-Beer-Icon.png'), //https://icons8.com/icon/8383/beer
  "Selected-Wine": require('../assets/Icons/Selected-Wine-Icon.png'), //https://icons8.com/icon/35909/wine
  "Selected-Liquor": require('../assets/Icons/Selected-Liquor-Icon.png'),// https://icons8.com/icon/108422/whiskey
  "Selected-Patio": require('../assets/Icons/Selected-Patio-Icon.png'), //https://icons8.com/icon/sP9KITYUy52Z/patio
  "Selected-Other": require('../assets/Icons/Selected-Other-Icon.png'), //https://icons8.com/icon/61873/more
  "Selected-Live-Music": require('../assets/Icons/Selected-Live-Music-Icon.png'), //https://icons8.com/icon/SsbicED9ubOc/concert
  "Selected-Trivia": require('../assets/Icons/Selected-Trivia-Icon.png'), //https://icons8.com/icon/25211/quiz
  "Selected-Karaoke": require('../assets/Icons/Selected-Karaoke-Icon.png'), //https://icons8.com/icon/KG6Flpzp7ixB/karaoke
  "Selected-Sports": require('../assets/Icons/Selected-Sports-Icon.png'), //https://icons8.com/icon/sIE784BZgmJT/sports
  "Selected-Greek": require('../assets/Icons/Selected-Greek-Icon.png'), //https://icons8.com/icon/15938/olive
  "Selected-Specials": require('../assets/Icons/Selected-Other-Drink.png'), //https://icons8.com/icon/55916/guinness-beer
  "Selected-Indian": require('../assets/Icons/Selected-Indian.png'), //https://icons8.com/icon/xabZcnwPKQYW/curry
  "Selected-BBQ": require('../assets/Icons/Selected-BBQ-Icon.png'), //https://icons8.com/icon/24290/weber
  "Selected-BOGO": require('../assets/Icons/Selected-Bogo-Icon.png'), //https://icons8.com/icon/12424/one-free
  "Selected-Breakfast": require('../assets/Icons/Selected-Breakfast-Icon1.png'), //https://icons8.com/icon/HFlENWU94Al6/breakfast
  "Selected-Carribean": require('../assets/Icons/Selected-Carribean-Icon.png'), //https://icons8.com/icon/pDY8ig7vTyVM/fish-dish
  "Selected-Wings-Icon": require('../assets/Icons/Selected-Wings-Icon.png'), //https://icons8.com/icon/osOCPfmaRZjJ/drumstick
  "Selected-Vegan": require('../assets/Icons/Selected-Vegan-Icon.png'), //https://icons8.com/icon/8445/vegan-food
  "Selecte-Salad": require('../assets/Icons/Selected-Healthy-Icon.png'), //https://icons8.com/icon/61873/more
  "Selected-Delivery-Icon": require('../assets/Icons/Selected-Delivery-Icon.png'), //https://icons8.com/icon/8290/delivery 
};

const iconMapping = {
  "food": ["For You", "CheapNite Favs", "Asian", "BBQ", "BOGO", "Breakfast", "Carribean", "Fast Food", "Greek", "Indian", "Italian", "Mexican", "Pizza", "Salad", "Vegan", "Wings", "Delivery", "Other"],
  "drink": ["For You", "CheapNite Favs", "Happy Hour", "Specials", "Beer", "Wine", "Liquor", "Patio", "Delivery", "Other"],
  "event": ["For You", "CheapNite Favs", "Live Music", "Trivia", "Karaoke", "Sports", "Other"],
};




const HorizontalScroll = ({ selectedTypes, setSelectedTag }) => {
  if (!selectedTypes || selectedTypes.length === 0) return null;

  let categories = [];
  selectedTypes.forEach(type => {
    categories = [...categories, ...iconMapping[type]];
  });

  // Remove duplicates
  categories = [...new Set(categories)];


  const [selectedTag, setSelectedTagInternal] = useState(null);

  const handleTagPress = (tag) => {
    const newSelectedTag = selectedTag === tag ? null : tag;
    setSelectedTag(newSelectedTag);
    setSelectedTagInternal(newSelectedTag);
  };

  const getCombinedCategories = (types) => {
    const allCategories = types.flatMap(type => iconMapping[type]);
    return [...new Set(allCategories)];
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map(category => {
          const isSelected = selectedTag === category;
          const iconKey = isSelected ? `Selected-${category.replace(/\s/g, '-')}` : category.replace(/\s/g, '-');
          const icon = icons[iconKey];

          return (
            <TouchableOpacity
              key={category}
              style={styles.iconContainer}
              onPress={() => handleTagPress(category)}
            >
              <Image
                source={icon}
                style={[styles.icon, isSelected && styles.selectedIcon]}
              />
              <Text
                style={[
                  styles.iconText,
                  isSelected && styles.selectedIconText, 
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333333',
    borderBottomColor: "white",
    borderBottomWidth: 1,
    paddingBottom: 1,
    marginBottom: 15,
  },
  iconContainer: {
    alignItems: 'center',
    marginHorizontal: 10,

  },
  icon: {
    width: 30, 
    height: 30, 
    paddingBottom: 2,

  },
  iconText: {
    color: 'white',
    textAlign: 'center',

  },
  selectedIconText: {
    color: 'rgb(81,150, 116)',
  },
  selectedIcon: {
    tintColor: 'rgb(81,150, 116)',
  }
});

export default HorizontalScroll;
