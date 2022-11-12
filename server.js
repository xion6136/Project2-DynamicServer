// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { response } = require('express');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'AirlineDB'); // <-- change this

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)
app.get('/', (req, res) => {
    let home = '/year/1998'; // <-- change this
    res.redirect(home);
});


// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
        let selected_year = parseInt(req.params.selected_year);
        let decrement_year = selected_year - 1;
        let increment_year = selected_year + 1;
        fs.readFile(path.join(template_dir, 'template.html'), (err, template) => {
        let response = template.toString();
        console.log(selected_year);
        if (selected_year > 1998 && selected_year < 2007) {
            response = response.replace("%%DYNAMIC_LINK1%%", '/year/' + increment_year);
            response = response.replace("%%DYNAMIC_LINK2%%", '/year/' + decrement_year);
        } 
        if (selected_year == 1998) {
            response = response.replace("%%DYNAMIC_LINK2%%", '/year/' + selected_year);
            response = response.replace("%%DYNAMIC_LINK1%%", '/year/' + increment_year);
        } 
        if (selected_year == 2007) {
            response = response.replace("%%DYNAMIC_LINK1%%", '/year/' + selected_year);
            response = response.replace("%%DYNAMIC_LINK2%%", '/year/' + decrement_year);
        } 
        if (selected_year < 1998 || selected_year > 2007) {
            res.status(404).send({message: 'Year ' + selected_year + ' does not exist in the database, please enter a year between 1998-2007'});
        } 
        response = response.replace("%%DYNAMIC_LINK1%%", '/year/' + increment_year);
        response = response.replace("%%DYNAMIC_LINK2%%", '/year/' + decrement_year);
        // modify `template` and send response
        // this will require a query to the SQL database
        let query = 'SELECT Month, DayOfMonth, DepTime, CSRDepTime, ArrTime, \
        CSRArrTime, UniqueCarrier, AirTime, AirDelay, DepDelay, Origin, \
        Dest, Distance, Cancelled FROM Year WHERE Year = ?';
        db.all(query, [selected_year], (err, rows) => {
            console.log(err);
            console.log(rows);
            let img = '/images/airline.jpg';

            response = response.replace("%%CURRENT_DYNAMIC_SUBJECT%%", "Year " + req.params.selected_year);
            response = response.replace('%%IMG_SRC%%', img);
            response = response.replace('%%IMG_ALT%%', 'photo of airline');
            response = response.replace('%%DYNAMIC_UP%%', 'Increment Year');
            response = response.replace('%%DYNAMIC_DOWN%%', 'Decrement Year');

            let year_data = '';
            
            for (let i = 0; i < 50; i++) {
                year_data = year_data + '<tr>';
                year_data = year_data + '<td>' + rows[i].Month + '</td>';
                year_data = year_data + '<td>' + rows[i].DayOfMonth + '</td>';
                year_data = year_data + '<td>' + rows[i].CSRDepTime + '</td>';
                year_data = year_data + '<td>' + rows[i].ArrTime + '</td>';
                year_data = year_data + '<td>' + rows[i].CSRArrTime + '</td>';
                year_data = year_data + '<td>' + rows[i].UniqueCarrier + '</td>';
                year_data = year_data + '<td>' + rows[i].AirTime + '</td>';
                year_data = year_data + '<td>' + rows[i].AirDelay + '</td>';
                year_data = year_data + '<td>' + rows[i].DepDelay + '</td>';
                year_data = year_data + '<td>' + rows[i].Origin + '</td>';
                year_data = year_data + '<td>' + rows[i].Dest + '</td>';
                year_data = year_data + '<td>' + rows[i].Distance + '</td>';
                year_data = year_data + '<td>' + rows[i].Cancelled + '</td>';
                year_data = year_data + '</tr>';
            } 
            response = response.replace('%%DYNAMIC_INFOMATION%%', year_data); 
            response = response.replace('%%DYNAMIC_H1%%', 'Why Airline Delay is Important to Sustainability')
            response = response.replace('%%DYNAMIC_PARAGRAPH%%', "Causes more gas emission to escape to the Earth's atmosphere \
            meaning that there will be more environmental harm. In other words, the longer the delay, cancellation, flight diversion, and so forth there are, \
            the more impact airline delay has on the environment. ")

            const ctx = Document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['AirTime', 'Air Delay', 'Departure Delay', 'Distance', 'Arrival Time', 'Scheduled Arrival Time'],
                    datasets: [{
                        label: 'Airline Delay',
                        data: [rows.ArrTime, rows.AirDelay, rows.DepDelay, rows.Distance, rows.ArrTime, rows.CSRArrTime],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            res.status(200).type('html').send(response); // <-- you may need to change this
        })
    });
});





app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
