document.addEventListener('DOMContentLoaded', function() {







    const config = {
        apiKey: "AIzaSyAYzgy54TZKLrt6zYFk56s6O47d9Ciu180",
        authDomain: "week7hw-65147.firebaseapp.com",
        databaseURL: "https://week7hw-65147.firebaseio.com",
        projectId: "week7hw-65147",
        storageBucket: "",
        messagingSenderId: "230237557865"
    };
    firebase.initializeApp(config);
    const firestore = firebase.firestore();
    const settings = {timestampsInSnapshots: true};
    firestore.settings(settings);
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    try {
      let app = firebase.app();
      let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
      console.log(`Firebase SDK loaded with ${features.join(', ')}`)
    } catch (e) {
      console.error(e);
      console.log('Error loading the Firebase SDK, check the console.')
    }


    const db = firebase.firestore();
    const game = db.collection('rpsGame').doc('global');

    game.get()
    .then(doc => {
        let  data = doc.data();
        let inProgress = data.inProgress;
        console.log(`GAME IN PROGRESS: ${inProgress}`)

        if (inProgress) {

        } else {
            // $('#p1_name').empty().text("Waiting for Player FOO")
            // <input type="text" name="name" id="name" placeholder="Name">
                // <button>Start</button>
                $('#welcome').empty()
                .append(
                    $('<input type="text" name="name" id="name" placeholder="Name">')
                )
                .append(
                    $('<button>').text("Start")
                )
        }
    })











  });