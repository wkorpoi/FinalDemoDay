const { ObjectId } = require("mongodb");
require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = function (app, passport, db) {
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  // PROFILE SECTION =========================
  app.get("/booking", isLoggedIn, function (req, res) {
    db.collection("trips").find().toArray((err, trips) => {
      if (err) return console.log(err);
      res.render("booking.ejs", {
        user: req.user,
        trips: trips
      });
    });
  });
  
  app.get("/contacts", isLoggedIn, function (req, res) {
    db.collection("contacts")
      .find({ currentUser: req.user.local.email })
      .toArray((err, contacts) => {
        console.log({ contacts });
        res.render("contacts.ejs", {
          user: req.user,
          contacts,
        });
      });
  });

  app.post("/inviteFriend", isLoggedIn, function (req, res){
  let contact = req.body
  console.log(contact)
  db.collection("contacts")
  .find({ currentUser: req.user.local.email })
  .toArray((err, contacts) => {
    res.render("contacts.ejs", {
      user: req.user,
      contacts,
    });
  });
  })

  // Picture API

  app.get("/profile", isLoggedIn, function (req, res) {
    const pictureApi = [];
    const currentUser = req.user.local.email;
  
    db.collection("trips").find({ user: currentUser }).toArray(async (err, trips) => {
      if (err) return console.log(err);
  
      for (let i = 0; i < trips.length; i++) {
        const data = await fetch(`https://api.unsplash.com/search/photos/?page=1&query=${trips[i].destination}.&client_id=5_9_CrMvsD7kOY3XGyIzuylcKWaxUvSfDUf1tC4ldBk`);
        const destination = await data.json();
        pictureApi.push(destination);
      }
  
      // Fetch the reviews from the database and pass them to the template
      db.collection("reviews").find().toArray((err, reviews) => {
        if (err) return console.log(err);
  
        res.render("profile.ejs", {
          user: req.user,
          trips: trips,
          pictureApi: pictureApi,
          review: reviews  // Include the reviews variable here
        });
      });
    });
  });
  
  app.get("/itenery/:tripId", isLoggedIn, function (req, res) {
    const id = req.params.tripId
    console.log({id})
    db.collection("itenery")
      .find({ tripId: id })
      .toArray((err, itenery) => {
        console.log({ itenery });
        res.render("itinerary.ejs", {
          user: req.user,
          itenery: itenery,
        });
      });
  });

  app.get("/food/:destination", isLoggedIn, function (req, res) {
    console.log(req.params.destination);
    const destination = req.params.destination;
    res.render("food.ejs", {
      destination: destination,
    });
  });

app.get('/trips/:id', isLoggedIn, function (req, res) {
  const tripId = req.params.id;
  const { ObjectId } = require('mongodb');

  try {
    const objectId = new ObjectId(tripId);
    
    db.collection('trips').findOne({ _id: objectId }, (err, trip) => {
    db.collection('itenery').find({ tripId }).toArray((err, itenery) => {  

      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred');
      }

      if (!trip) {
        return res.status(404).send('Trip not found');
      }

      db.collection('contacts').find({ currentUser: req.user.local.email }).toArray((err, contacts) => {
        if (err) {
          console.log(err);
          return res.status(500).send('An error occurred');
        }
        const hasItenery = itenery.length > 0
        console.log({hasItenery})

        res.render('trip.ejs', {
          user: req.user,
          trip: trip,
          contacts: contacts,
          hasItenery
        });
      });
    });
  });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Invalid trip ID');
  }
});

// invite friend

  app.post("/invite/:tripId", isLoggedIn, function (req, res) {
    const tripId = req.params.tripId;
    const invitedFriend = req.body.invitedFriend;
    // go to the contacts collection, find the invited friend, go to the trips collection, find the specific trip with the tripId, then send a text to the friend that includes that trip data
    const currentUser = req.user.local.email;
    const collection = db.collection("contacts")
    const query = {_id : ObjectId (req.params.tripId)}
    const phoneNumber = req.user.local.phoneNumber

    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        try {
          const googleKey = process.env.GOOGLE_PASSWORD
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: 'wadiyakorpoi@gmail.com',
              pass: googleKey
            }
          });
          var mailOptions = {
            from: 'wadiyakorpoi@gmail.com',
            to: invitedFriend,
            subject: 'Your My Travel Guru Itinerary',
            text: `Here is your itinerary from The Travel Guru: ${newTrip}`
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Saved! ' + info.response);
            }
          });
        } catch (err) {
          console.log(err);
        }
        res.redirect('back');
      })
  
      .catch(error => {
        // Handle error
        console.error(error);
      });
      
        });

  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout(() => {
      console.log("User has logged out!");
    });
    res.redirect("/");
  });

  // message board routes ===============================================================
  app.post("/add", (req, response) => {
    db.collection("trips").insertOne(
      {
        destination: req.body.destination,
        start: req.body.startDate,
        end: req.body.endDate,
        user: req.user.local.email,
        interests: req.body.interests
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        let destinationId = result.insertedId;
        response.redirect("/trips/" + destinationId);
      }
    );
  });

  app.post("/profile", (req, response) => {
    db.collection("review").insertOne(
      {
        review: req.body.review,
        rating: req.body.rating
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        // let destinationId = result.insertedId;
        // response.redirect("/trips/" + destinationId);
      }
    );
  });

  app.put('/edit', (req, res) => {
    db.collection('review')
    .findOneAndUpdate({_id:ObjectId(req.body._id)}, {
      $set: {
      review:req.body.newText
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })

  app.get("/submitrequest/:tripId", isLoggedIn, async function (req, res) {
    const currentUser = req.user.local.email;
    const tripId = req.params.tripId;

    const collection = db.collection("trips")
    const query = {_id : ObjectId (req.params.tripId)}
    const obj = await collection.findOne(query)

    const currentUserDestination = obj.destination
    const currentUserStartDate = obj.start
    const currentUserEndDate = obj.end
    const interests = obj.interests
    const phoneNumber = req.user.local.phoneNumber

    const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    const key = process.env.OPENAI_API_KEY
    const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  };

  const messages = [
    { role: 'user', content: `Create an itinerary for a trip to ${currentUserDestination} from ${currentUserStartDate} to ${currentUserEndDate}. Include ${interests}` },
  ];
  
    const data = {
      messages: messages,
      model: 'gpt-3.5-turbo',
    };

  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(result => {
      // Handle the API response  
       
        const newTrip = result.choices[0].message.content 
        console.log(newTrip);

      db.collection("itenery").insertOne(
        {
          trip: newTrip,
          email: req.user.local.email,
          location: obj.destination,
          tripId
        },
        
        (err, result) => {
          if (err) return console.log(err);
          console.log("saved to database");      
        }
      );
      try {
        const googleKey = process.env.GOOGLE_PASSWORD
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'wadiyakorpoi@gmail.com',
            pass: googleKey
          }
        });
        var mailOptions = {
          from: 'wadiyakorpoi@gmail.com',
          to: req.user.local.email,
          subject: 'Your My Travel Guru Itinerary',
          text: `Here is your itinerary from The Travel Guru: ${newTrip}`
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Saved! ' + info.response);
          }
        });
      } catch (err) {
        console.log(err);
      }
      res.redirect('back');
    })

    .catch(error => {
      // Handle error
      console.error(error);
    });
    
      });

// TarGET ITEN ID

  app.post("/addFriend", (req, res) => {
    console.log(req.body);
    db.collection("contacts").insertOne(
      {
        friendName: req.body.name,
        phoneNumber: req.body.number,
        currentUser: req.user.local.email,
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        res.redirect("/contacts");
      }
    );
  });

  app.put('/edit', (req, res) => {
    db.collection('contacts')
    .findOneAndUpdate({_id:ObjectId(req.body._id)}, {
      $set: {
      contacts:req.body.phoneNumber
      }
      
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })

  app.delete('/deleteDestination', (req, res) => {
    db.collection('trips').findOneAndDelete({destination: req.body.destination}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get("/login", function (req, res) {
    res.render("signup-register.ejs", { message: req.flash("loginMessage") });
  });

  // process the login form
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // SIGNUP =================================
  // show the signup form
  app.get("/signup", function (req, res) {
    res.render("signup-register.ejs", { message: req.flash("signupMessage") });
  });

  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error - HOW DO I MAKE AN ERROR MESSAGE?
      failureFlash: true, // allow flash messages
    })
  );

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get("/unlink/local", isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect("/profile");
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}

async function fetchPic(destination){
  const data = await fetch(`https://api.unsplash.com/search/photos/?page=1&query= ${destination}.&client_id=5_9_CrMvsD7kOY3XGyIzuylcKWaxUvSfDUf1tC4ldBk`);
  return await data.json
}
