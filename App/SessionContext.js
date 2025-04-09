import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, setDoc, getDoc } from '@firebase/firestore';
import { db } from './firebase'; // make sure to import db from correct path

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [favoritedDeals, setFavoritedDeals] = useState("");
  const [dealsData, setDealsData] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [restaurantDeals, setRestaurantDeals] = useState([]);
  const [noAuthFavoritedDeals, setNoAuthFavoritedDeals] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Fetch and update the favorited deals in Firestore whenever they change
  useEffect(() => {
    if (session) {
      const userFavoritesRef = doc(db, 'user_favorites', session.userData.email);

      const fetchAndUpdateFavorites = async () => {
        // Fetching favorites if not already
        if(favoritedDeals === ""){
          const userFavoritesSnap = await getDoc(userFavoritesRef);
          if (userFavoritesSnap.exists()) {
            const data = userFavoritesSnap.data();
            setFavoritedDeals(data.favoritedDeals);
          } else {
            setFavoritedDeals([]);
          }
        }
        
        // Updating favorites
        await setDoc(userFavoritesRef, { favoritedDeals: favoritedDeals }, { merge: true });
      };

      fetchAndUpdateFavorites();
    }
  }, [session, favoritedDeals]);

  return (
    <SessionContext.Provider value={{ session, setSession, favoritedDeals, setFavoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData, restaurantDeals, setRestaurantDeals,noAuthFavoritedDeals, setNoAuthFavoritedDeals, userLocation, setUserLocation }}>
      {children}
    </SessionContext.Provider>
  );
};
