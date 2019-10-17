$(document).ready(() => {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    let database = firebase.database();

    let table = $('table');

    database.ref().on('value', (snapshot) => {
        table.empty();
        table.html(`<tr>
            <th>Train Name</th>
            <th>Destination</th>
            <th>Frequency (min)</th>
            <th>Next Arrival</th>
            <th>Time til Arrival (min)</th>
            </tr>`);

        snapshot.forEach((childSnapshot) => {
            let val = childSnapshot.val();
            table.append(`<tr>
            <td class="name">${val.name}</td>
            <td class="destination">${val.destination}</td>
            <td class"frequency">${val.frequency}</td>
            <td class"nextTrain">${calcNextTrainTime(val.initTime, val.frequency).time}</td>
            <td class="timeTil">${calcNextTrainTime(val.initTime, val.frequency).timeTil}</td>
            <tr>`);
        })
    })

    $('#submit').on('click', function (event) {
        event.preventDefault();

        let trainName = $('#train-name').val().trim();
        let trainDest = $('#train-destination').val().trim();
        let trainTime = $('#train-time').val().trim();
        let trainFreq = $('#train-freq').val().trim();

        let nextArrival = calcNextTrainTime(trainTime, trainFreq);

        let newTrain = {
            name: trainName,
            initTime: trainTime,
            destination: trainDest,
            frequency: trainFreq
        }

        database.ref().push(newTrain);

        console.log('name: ', trainName);
        console.log('dest: ', trainDest);
        console.log('time: ', trainTime);
        console.log('next train: ', nextArrival)
    });
})

function calcNextTrainTime(firstTime, freq) {
    firstTime = moment(firstTime, 'HH:mm').subtract(1, "years");
    let currentTime = moment();
    let dTime = currentTime.diff(firstTime, 'minutes');
    let tMod = dTime % freq;
    let timeTilTrain = freq - tMod;
    let nextTrain = moment().add(timeTilTrain, 'minutes').format('HH:mm');
    return {
        time: nextTrain,
        timeTil: timeTilTrain
    }
}