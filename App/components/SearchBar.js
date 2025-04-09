import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity } from 'react-native';

const searchIcon = require('../assets/Search-Icon.png');
const filterIcon = require('../assets/Filter-Icon2.png');

const SearchBar = ({ onSearch, onFilterPress }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    onSearch(text);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#333333', paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: 'white', borderRadius: 20, backgroundColor: 'white', alignItems: 'center' }}>
        <Image source={searchIcon} style={{ width: 20, height: 20, marginLeft: 12 }} />
        <TextInput
          placeholder="Search deals by title, by restaurant, or by day!"
          placeholderTextColor={'grey'}
          style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, color: 'black' }}
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
        <TouchableOpacity onPress={onFilterPress}>
          <Image source={filterIcon} style={{ width: 20, height: 20, marginRight: 12 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;
