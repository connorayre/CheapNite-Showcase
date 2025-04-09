import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import tagsData from '../assets/tags.json'; 


const QuoteBar = () => {
    const [quotes, setQuotes] = useState([]);
    const [currentQuote, setCurrentQuote] = useState('');

    useEffect(() => {
        setQuotes(tagsData.quotes);
    }, []);

    useEffect(() => {
        if (quotes.length > 0) {
            const newQuote = getRandomQuote();
            setCurrentQuote(newQuote);
        }
    }, [quotes]);


    function getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{currentQuote}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 25,
        paddingHorizontal: 16,
        backgroundColor: 'rgb(81, 150, 116)',
    },
    text: {
        textAlign: 'center', 
        color: 'white',
        fontSize: 13,
    },
});

export default QuoteBar;