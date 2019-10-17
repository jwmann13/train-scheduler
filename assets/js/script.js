// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();

$(document).ready(() => {
    let table = $('table');
    
    // write any changes to database to the page
    database.ref().on('value', (snapshot) => {
        table.empty();
        table.html(`<tr>
            <th class="col s3">Train Name</th>
            <th class="col s3">Destination</th>
            <th class="col s1">Frequency (min)</th>
            <th class="col s3">Next Arrival</th>
            <th class="col s1">Time til Arrival (min)</th>
            <th class="col s1"></th>
            </tr>`);

        snapshot.forEach((childSnapshot) => {
            let val = childSnapshot.val();
            let key = childSnapshot.key;
            table.append(`<tr id="${key}">
            <td class="name">${val.name}</td>
            <td class="destination">${val.destination}</td>
            <td class"frequency">${val.frequency}</td>
            <td class"nextTrain">${calcNextTrainTime(val.initTime, val.frequency).time}</td>
            <td class="timeTil">${calcNextTrainTime(val.initTime, val.frequency).timeTil}</td>
            <td class="remove">X</td>
            <tr>`);
        })
    })

    // submit form data to database
    $('#submit').on('click', (event) => {
        event.preventDefault();
        $('form :input').attr('value', '');

        let trainName = $('#train-name').val().trim();
        let trainDest = $('#train-destination').val().trim();
        let trainTime = $('#train-time').val().trim();
        let trainFreq = $('#train-freq').val().trim();

        let nextArrival = calcNextTrainTime(trainTime, trainFreq);

        let newTrain = {
            name: trainName,
            initTime: trainTime,
            destination: trainDest,
            frequency: trainFreq,
            nextTrain: nextArrival
        }

        database.ref().push(newTrain);
    });

    // remove train from table and database when remove button is clicked
    $('table').on('click', '.remove', (event) => {
        let toRemove = event.target.parentElement.id;
        removeTrain(toRemove)
    });

    // init timepicker for time input field
    $('.timepicker').timepicker();
});


// calculate time for next train using momentjs
function calcNextTrainTime(firstTime, freq) {
    firstTime = moment(firstTime, 'hh:mm a').subtract(1, "years");
    let currentTime = moment();
    let dTime = currentTime.diff(firstTime, 'minutes');
    let tMod = dTime % freq;
    let timeTilTrain = freq - tMod;
    let nextTrain = moment().add(timeTilTrain, 'minutes').format('hh:mm a');
    return {
        time: nextTrain,
        timeTil: timeTilTrain
    }
}

// remove train from database
function removeTrain(ID) {
    database.ref().child(ID).remove();
}