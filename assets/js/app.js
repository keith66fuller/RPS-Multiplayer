document.addEventListener('DOMContentLoaded', function () {
    const game = {
        Rock: 2,
        Scissors: 1,
        Paper: 0
    }
    const config = {
        apiKey: "AIzaSyBlpgyV1NYKnitdSRUCP83Bb1Sl6qWqEQ0",
        authDomain: "multiplayer-rockpaperscissors.firebaseapp.com",
        databaseURL: "https://multiplayer-rockpaperscissors.firebaseio.com",
        projectId: "multiplayer-rockpaperscissors",
        storageBucket: "multiplayer-rockpaperscissors.appspot.com",
        messagingSenderId: "456807530612"
    };

    firebase.initializeApp(config);

    const player = {
        name: null,
        win: 0,
        lose: 0,
        draw: 0,
        slot: null
    };

    let otherPlayer;

    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        console.log(`Firebase SDK loaded with ${features.join(', ')}`)
    } catch (e) {
        console.error(e);
        console.log('Error loading the Firebase SDK, check the console.')
    }


    const db = firebase.database();
    const dbRef = db.ref();
    const connectionsRef = db.ref("/connections");
    const connectedRef = db.ref(".info/connected");

    dbRef.update({ turn: 0 });

    window.addEventListener("beforeunload", function (event) {
        console.log(`Before Unload ${event}`)
        console.log(JSON.stringify(player))
        if (player.slot) {
            db.ref(`players/${player.slot}`).remove()
                .then(function () {
                    console.log("Remove succeeded.")
                })
                .catch(function (error) {
                    console.log("Remove failed: " + error.message)
                });
        }
    });

    // Player takes a turn
    $('.gameButton').on('click', function () {
        console.log($(this).text())
        console.log($(this).parent().prop('id'))
        let playerNum = $(this).prop('id').toString().match(/^p(.)/)[1]
        console.log(`player ${playerNum} ${player.slot}`)
        if (playerNum == player.slot) {
            dbRef.child('players').child(playerNum).update({ choice: $(this).text() })
            player.choice = $(this).text();
            $(`.${player.num} .gameButton`).hide();
            $(this).show();
            dbRef.child('turn').transaction((turn) => {
                console.log(`TURN: ${turn}`)

                if (turn == 2) {
                    console.log(`${player.name} chose ${player.choice}`);
                    console.log(`${otherPlayer.name} chose ${otherPlayer.choice}`);
                    let p = game[player.choice];
                    let o = game[otherPlayer.choice];
                    let winner;
                    if (Math.abs(p-o) > 1) {
                        winner = (o>p)
                    } else {
                        winner = (p>0)
                    }

                    console.log(`Winner is ${winner}`)
                }





                return ++turn;
            });
        }
    })

    // Event fires when player takes a turn
    // firebase.database().ref('turn').on('value', (snapshot) => {
    //     const turn = snapshot.val();
    //     console.log(`TURN EVENT turn==${turn}`)
    //     if (turn==0) {
    //         console.log('NO TURN EVENT')
    //     } else if (turn == 3) {
    //         if (snapshot.child(`players/1`).exists() && snapshot.child(`players/2`).exists()) {
    //             console.log(snapshot.child('players/1/choice').val() + ' ' + snapshot.child('players/2/choice').val())
    //             let choice = {}
    //             if (snapshot.child('players/1/choice').val() && snapshot.child('players/2/choice').val()) {
    //                 choice[1] = game[snapshot.child('players/1/choice').val()]
    //                 choice[2] = game[snapshot.child('players/2/choice').val()]

    //                 if (choice[1] == choice[2]) {
    //                     [1, 2].forEach(num => {
    //                         dbRef.child(`players/${num}/choice`).transaction(() => {
    //                             return null;
    //                         }, null, false);
    //                     });

    //                     [1, 2].forEach(num => {
    //                         console.log(`NUM 105: ${num}`)
    //                         firebase.database().ref(`players/${num}/draw`).transaction((draws) => {
    //                             return ++draws;
    //                         }, null, false);

    //                     });
    //                 }
    //             }
    //         }

    //         dbRef.update({ turn: 1 })
    //     } else {
    //         [1,2].forEach(num => {
    //             console.log(`ELSE TURN: ${turn} num=${num} player.slot=${player.slot}`);
    //             if (num == player.slot) {
    //                 $('#gameMsg').text("It's Your Turn!");
    //             } else {
    //                 $('gameMsg').text("Waiting for other player to choose.");
    //             }
    //         })
    //     }

    // }, null, false);

    // dbRef.child('turn').once('value', tSnap => {
    //     if (tSnap.val() == 0) {
    //         // $('.player1#gameMsg').text("It's Your Turn!");
    //         // $('.player2#gameMsg').text(`Waiting for ${snapshot.child(`players/1/name`).val()} to choose.`);
    //         dbRef.child('turn').transaction(() => { return 1 })
    //     } else if (tSnap.val() == 1) {
    //         // $('.player2#gameMsg').text("It's Your Turn!");
    //         // $('.player1#gameMsg').text(`Waiting for ${snapshot.child(`players/2/name`).val()} to choose.`);
    //         dbRef.child('turn').transaction(() => { return 2 });
    //     }

    // });


    firebase.database().ref('turn').on('value', turn => {
        turn = JSON.stringify(turn)
        if (turn) {
            if (turn==3) {

            } else if (turn == player.slot) {
                $('#gameMsg').text("It's Your Turn!");
            } else {
                if (otherPlayer) {
                    $('#gameMsg').text(`Waiting for ${otherPlayer.name} to choose.`);
                } else {}
                    $('#gameMsg').text(`Waiting for the other player to choose.`);
            }
        }
    });



    // Event fires on IPL and whenever *anything* in the db changes.
    db.ref('players').on('value', (snapshot) => {

        if (player.slot) {
            if (snapshot.child(player.slot % 2 + 1).exists()) {
                console.log(`I am player ${player.slot} and there is a player ${player.slot % 2 + 1}`)
                otherPlayer = snapshot.child(player.slot % 2 + 1).val();
                console.log('Here he is ' + JSON.stringify(otherPlayer))
            }
        }

        // Local
        [1, 2].forEach(num => {
            let name = snapshot.child(`${num}/name`).val();
            if (player.slot == num) {
                if (snapshot.child(num).exists()) {
                    $('#welcome').empty()
                        .append(
                            $('<h3>').text(`Hi ${name}!  You are Player ${num}`)
                        )
                        .append(
                            $(`<h3 class="player${num}" id="gameMsg">`)
                        );
                } else {

                }
            } else if (!player.slot) {
                // Intially show the login form
                $('#welcome').empty()
                    .append(
                        $('<input type="text" name="playerName" id="playerName" placeholder="Name">')
                    )
                    .append(
                        $('<button id="startButton">').text("Start")
                    )

            }
        });
        // Both
        [1, 2].forEach(num => {
            if (snapshot.child(num).exists()) {
                let name = snapshot.child(`${num}/name`).val();
                console.log(`Drawing player ${num} - ${name}`)
                $(`.${num}.nameTag`).text(name);
                if (snapshot.child(num).child('choice').exists()) {
                    // console.log(`Drawing choice ${snapshot.child(num).child('choice').val()}`)
                    // $(`.${num}.gameButton`).hide();
                    // $(`.${num}.gameButtons`).append(
                    //     $('<h4>').addClass(num).addClass('choice').text("CHOICE")
                    //     // snapshot.child(num).child('choice').val()
                    // );
                } else {
                    $(`.${num}.choice`).remove();
                    $(`.${num}.gameButton`).show();
                }
                $(`.${num}.stats`).show();
            } else {
                $(`.${num}.nameTag`).text(`Waiting for Player ${num}`)
                $(`${num}.gameButton`).hide();
                $(`.${num}.stats`).hide();
            }
        });

    });


    // Event fires when user clicks Start after having put in his name.
    $('#welcome').on('keyup', '#playerName', (e) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("startButton").click();
        }
    })
    $('#welcome').on('click', '#startButton', (e) => {
        player.name = $('#playerName').val();
        dbRef.once('value', snapshot => {
            player.slot = snapshot.hasChild('players/1') + snapshot.hasChild('players/2') + 1;
            console.log(`Slot will be ${player.slot}`)
        }).then(() => {
            dbRef.child('players').child(player.slot).set({
                name: player.name,
                win: 0,
                lose: 0,
                draw: 0,
                slot: player.slot
            })
                .catch(e => {
                    console.log(e);
                })
                .then(() => {
                    if (player.slot == 2) {
                        dbRef.child('turn').transaction(turn => {
                            return (turn == 0) ? 1 : turn;
                        }, (err, commit, turn) => {
                            console.log(`TURN IS NOW ${turn}`);
                            console.log(JSON.stringify(turn))

                        });
                    }
                })
        })
    });














});