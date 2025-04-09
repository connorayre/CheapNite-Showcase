const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cfg = require('./cfg/cfg');
const multer = require('multer');
const upload = multer();

const app = express();
const port = process.env.PORT || 5000;
//---------------------------------------------------------------------------------------------------------------
// Database connection configuration
const db = mysql.createConnection(cfg);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    return;
  }
  console.log('Connected to the database');
});
//---------------------------------------------------------------------------------------------------------------
// Middleware to parse request body as JSON
app.use(bodyParser.json());




//---------------------------------------------------------------------------------------------------------------
// Login endpoint
// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Trying to login");

  // Server-side validation for the email and password
  if (email.length < 3) {
    return res.status(400).json({ error: 'email must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Check if the email exists in the users database
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length === 0) {
      // If user does not exist, check in restaurants database
      db.query('SELECT * FROM restaurants WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ error: 'An error occurred' });
          return;
        }

        if (results.length === 0) {
          // email does not exist in users or restaurants
          res.status(401).json({ error: 'Invalid credentials: User does not exist' });
          return;
        }

        // Proceed with restaurant login
        const restaurant = results[0];

        bcrypt.compare(password, restaurant.password, (bcryptErr, isMatch) => {
          if (bcryptErr) {
            console.error('Password comparison error:', bcryptErr);
            res.status(500).json({ error: 'An error occurred' });
            return;
          }
      
          if (!isMatch) {
            // Invalid password
            console.log("Invalid password");
            res.status(401).json({ error: 'Invalid credentials: Invalid password' });
            return;
          }
      
          // Password is correct, create a JWT token
          const token = jwt.sign({ userId: restaurant.id }, 'secret_key', { expiresIn: '1h' });
      
          // Retrieve the account's "type" from the database
          //const accountType = restaurant.type;
          const currentUser = {type: restaurant.type, email: restaurant.email, phoneNumber: restaurant.phoneNumber, restaurantName: restaurant.restaurantName, relationship: restaurant.relationship}
      
          // Send the token as a response
          res.json({success: true, token, currentUser });
        });
      });

    } else {
      // Proceed with user login
      const user = results[0];

      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error('Password comparison error:', bcryptErr);
          res.status(500).json({ error: 'An error occurred' });
          return;
        }
    
        if (!isMatch) {
          // Invalid password
          console.log("Invalid password");
          res.status(401).json({ error: 'Invalid credentials: Invalid password' });
          return;
        }
    
        // Password is correct, create a JWT token
        const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
    
        // Retrieve the account's "type" from the database
        //const accountType = user.type;
        const currentUser = {type: user.type, email: user.email, phoneNumber: user.phoneNumber}
    
        // Send the token as a response
        res.json({success: true, token, currentUser});
      });
    }

    

  });
});


//---------------------------------------------------------------------------------------------------------------

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, password, phoneNumber, type } = req.body;
  console.log("trying to signup");
 
  // Server-side validation for the email and password
  // Email validation
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Password validation
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        'Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long',
    });
  }

  // Check if the email is already taken
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log("1")
    console.log("results = " + results)
    if (results.length > 0) {
      // email is already taken
      res.status(409).json({ error: 'email is already taken' });
      return;
    }
    console.log("2")

    // Hash the password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Password hashing error:', hashErr);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }

      console.log("3")
      // Insert the user into the database
      db.query(
        'INSERT INTO users (email, password, phone_number, type) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, phoneNumber, type],
        (insertErr) => {
          if (insertErr) {
            console.error('Database query error:', insertErr);
            res.status(500).json({ error: 'An error occurred' });
            return;
          }

        // User registration successful
        console.log("Sending success 200");
        res.status(200).json({ success: true, message: 'User registration successful' });

      });
    });
  });
});
//---------------------------------------------------------------------------------------------------------------

// Restaurant Signup endpoint
app.post('/restaurant-signup', (req, res) => {
  const { email, password, phoneNumber, restaurantName, relationship, type, verified } = req.body;
 
  // Server-side validation for the email, password, restaurantName, phoneNumber, and relationship

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        'Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long',
    });
  }

  if (!validateRestaurantName(restaurantName)) {
    return res.status(400).json({ error: 'Invalid restaurant name' });
  }

  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  if (!validateRelationship(relationship)) {
    return res.status(400).json({ error: 'Invalid relationship' });
  }

  if(type != 1){
    return res.status(400).json({ error: 'Invalid type' });
  }

  if(verified != false){
    return res.status(400).json({ error: 'Invalid verified' });
  }

  // Check if the email is already taken in users table
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length > 0) {
      // email is already taken in users table
      res.status(409).json({ error: 'email is already taken' });
      return;
    }

    // If the email is not taken in users table, then check in restaurants table
    db.query('SELECT * FROM restaurants WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }

      if (results.length > 0) {
        // email is already taken in restaurants table
        res.status(409).json({ error: 'email is already taken' });
        return;
      }

      // Hash the password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Password hashing error:', hashErr);
          res.status(500).json({ error: 'An error occurred' });
          return;
        }

        // Insert the restaurant into the database
        db.query(
          'INSERT INTO restaurants (restaurantName, email, password, phoneNumber, relationship, type, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [restaurantName, email, hashedPassword, phoneNumber, relationship, type, verified],
          (insertErr) => {
            if (insertErr) {
              console.error('Database query error:', insertErr);
              res.status(500).json({ error: 'An error occurred' });
              return;
            }

          // Restaurant registration successful
          res.status(200).json({ success: true, message: 'Restaurant registration successful' });
        });
      });
    });
  });
});


//---------------------------------------------------------------------------------------------------------------
//add deal endpoint:

app.post('/add-deal', (req, res) => {
  const deal = req.body;
 
  // Server-side validation for the fields
  if (!isTitleValid(deal.dealTitle)) {
    return res.status(400).json({ error: 'Title must be 100 characters or less' });
  }

  if (!isLocationValid(deal.location)) {
    return res.status(400).json({ error: 'Location must be 100 characters or less' });
  }
/*
  if (!isStartDateValid(deal.startDate)) {
    return res.status(400).json({ error: 'Start date must not be earlier than today' });
  }

  if (!isEndDateValid(deal.startDate, endDate)) {
    return res.status(400).json({ error: 'End date must not be earlier than start date' });
  }
*/
  if (!isDescriptionValid(deal.dealDescription)) {
    return res.status(400).json({ error: 'Description must be 250 characters or less' });
  }

  if (!isTermsValid(deal.terms)) {
    return res.status(400).json({ error: 'Terms and conditions must be 250 characters or less' });
  }

  // Image can be checked too if necessary. You need to decide how you want to handle it.
  if(!deal.image){
    return res.status(400).json({ error: 'Please Submit an image' });
  }
  // Insert the deal into the database
  db.query(
    'INSERT INTO restaurant_deals (email, restaurant_name, deal_title, location, start_date, end_date, deal_description, terms_and_conditions, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [deal.email, deal.restName, deal.dealTitle, deal.location, deal.startDate, deal.endDate, deal.dealDescription, deal.terms, deal.image],
    (insertErr) => {
      if (insertErr) {
        console.error('Database query error:', insertErr);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }

      // Deal creation successful
      res.status(200).json({ success: true, message: 'Deal created successfully' });
    }
  );
});


//---------------------------------------------------------------------------------------------------------------
app.get('/api/rest-deals', async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'Missing email query parameter' });
  }

  try {
    // This is just an example and may not work for your actual database schema
    // Update the SQL query based on your database structure and data type of the columns.
    db.query(
      'SELECT * FROM restaurant_deals WHERE email = ?', 
      [userEmail], 
      (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ error: 'Failed to fetch deals' });
          return;
        }

        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

//---------------------------------------------------------------------------------------------------------------
//get deals for users
app.get('/api/user-deals', async (req, res) => {
  try {
    // This is just an example and may not work for your actual database schema
    // Update the SQL query based on your database structure and data type of the columns.
    // First, select all restaurant emails that have 'verified' set to true
    db.query(
      'SELECT email FROM restaurants WHERE verified = true', 
      [], 
      (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ error: 'Failed to fetch restaurant emails' });
          return;
        }

        // If we have restaurant emails, create an array of promises to get all deals from these restaurants
        if(results.length > 0){
          console.log("results is: "+ results)
          let emailArr = results.map(res => res.email);
          let promises = emailArr.map(email => {
            return new Promise((resolve, reject) => {
              db.query(
                'SELECT * FROM restaurant_deals WHERE email = ?',
                [email],
                (err, deals) => {
                  if(err) {
                    reject(err);
                  } else {
                    resolve(deals);
                  }
                }
              );
            });
          });

          // Execute all promises and send the deals to client
          Promise.all(promises).then(deals => {
            let allDeals = [].concat.apply([], deals); // flatten the deals array
            res.status(200).json(allDeals);
          }).catch(err => {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Failed to fetch deals' });
          });

        } else {
          res.status(200).json([]); // no verified restaurants found, return an empty array
        }
      }
    );
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

//---------------------------------------------------------------------------------------------------------------
//token refresh endpoint
app.post('/refresh-token', (req, res) => {
  console.log("Inside: /refresh-token")
  // Extract the refresh token from the request body
  const refreshToken = req.body.refresh_token;
  
  // Verify the refresh token
  jwt.verify(refreshToken, 'your-refresh-token-secret', (err, decoded) => {
    if (err) {
      // Token verification failed
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: decoded.userId }, 'your-access-token-secret', {
      expiresIn: '15m', // Set the desired expiration time
    });

    // Send the new access token as the response
    res.status(200).json({ accessToken: newAccessToken });
  });
});

//---------------------------------------------------------------------------------------------------------------
//Server validations

const validateEmail = (email) => {
  // Add your desired email validation logic here
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Add your desired password validation logic here
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?&]{8,}$/;

  return passwordRegex.test(password);
};

  // Restaurant name validation
  const validateRestaurantName = (restaurantName) => {
    if(restaurantName.length > 30){
      return false;
    }
    return true;
  };
  
  // Phone number validation
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/; // Should contain exactly 10 digits
    return phoneRegex.test(phoneNumber);
  };
  
  // Relationship validation
  const validateRelationship = (relationship) => {
    if(relationship.length > 30){
      return false;
    }
    return true;
  };

  const isTitleValid = (title) => {
    return title.length <= 100 && title.length > 0;
  };
  
  const isLocationValid = (location) => {
    return location.length <= 100 && location.length > 0;
  };
  
  const isStartDateValid = (startDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // set the time to 00:00:00
    return startDate >= now;
  };
  
  const isEndDateValid = (startDate, endDate) => {
    return endDate >= startDate;
  };
  
  const isDescriptionValid = (description) => {
    return description.length <= 250 && description.length > 0;
  };
  
  const isTermsValid = (terms) => {
    return terms.length <= 250 && terms.length > 0;
  };

//---------------------------------------------------------------------------------------------------------------

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});