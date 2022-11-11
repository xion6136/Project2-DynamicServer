// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


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
    let home = '/year/1987'; // <-- change this
    res.redirect(home);
});


// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
        let selected_year = parseInt(req.params.selected_year);
        console.log(selected_year);
        fs.readFile(path.join(template_dir, 'template.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        let query = 'Select Month, DayOfMonth, DepTime, CSRDepTime, ArrTime, \
        CSRArrTime, UniqueCarrier, AirTime, AirDelay, DepDelay, Origin, \
        Dest, Distance, Cancelled from Year Where Year = ?';
        db.all(query, [selected_year], (err, rows) => {
            console.log(query);
            console.log(err);
            console.log(rows);
            let response = template.toString();
            let img = '/images/airline.jpg';

            response = response.replace("%%CURRENT_DYNAMIC_SUBJECT%%", "Year " + req.params.selected_year);
            response = response.replace('%%IMG_SRC%%', img);
            response = response.replace('%%IMG_ALT%%', 'photo of airline');
            let year_data = '';
           /* for (let i = 0; i < 100; i++) {
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
            console.log(rows);
            response = response.replace('%%YEAR_INFO%%', year_data); */
            res.status(200).type('html').send(response); // <-- you may need to change this
        })
    });
});


app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
