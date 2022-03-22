'use strict';
const dayjs = require('dayjs');
const sqlite = require('sqlite3');


var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
var localizedFormat = require('dayjs/plugin/localizedFormat');


dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);






function Film(id, title, favorite, watchdate, rating) {
    this.id = id;
    this.title = title;
    this.favorite = favorite;
    // allowed to use an empty string "" for the date and the 

    if ( dayjs(watchdate).isValid() ){
        this.date = watchdate;
    }
    else {
        this.date = "<not defined>";
    }

    this.rating = rating;

    this.printFilm = function () {
        //        Id: 1, Title: Pulp Fiction, Favorite: true, Watch date: March 10, 2022, rating: 5
        console.log("Id: %d, Title: %s, Favorite: %s, Watch date: %s, rating: %s", id, title, favorite, watchdate, rating);
    }

}


function FilmLibrary() {
    const db = new sqlite.Database('./films.db', (err) => {
        if (err) {
            throw err;
        }
    });


    this.addFilm = (film) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO films (id, title, favorite, watchdate, rating) VALUES(?,?,?,?,?)';
            db.run(sql, [film.id, film.title, film.favorite, film.date, film.rating], (err) => {
                if (err) {
                    reject(err => console.log("Errore inserimento in tabella ", err.name));
                } else {
                    resolve(true);
                }
            });
        });
    };



    this.deleteFilm = function (id) {

        library = library.filter(x => {
            return x.id.toString() !== id.toString();
        })
    }

    this.getRated = function () {
        let i = 0;
        console.log('***** Films filtered, only the rated ones *****');
        library.filter(film => isNaN(Number(film.rating)) == false)
            .forEach(e => {
                e.printFilm()
                i = i + 1;
            });

        if (i == 0)
            console.log("\t\t->There are not films rated yet<-");
    }

    this.sortByDate = () => {

        this.library.sort(function (a, b) {
            if (dayjs(a.date).isSameOrBefore(b.date) || dayjs(b.date).isValid() == false)
                return -1;

            else
                return 1;
        });
    }

    this.resetWatchedFilms = () => {
        this.library.forEach((film) => film.date = '');

    }


    this.delete = (id) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM films WHERE id = ?';
            db.run(sql, [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                    console.log("Film con id = %d cancellato correttamente", id);
                }
            });
        });

    }

    this.all = () => {
        return new Promise((resolve, reject) => {
            const sql_all = "SELECT * FROM films";

            db.all(sql_all, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map((f) =>
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)
                    ));
                }
            });
        });
    };



    this.favorite = () => {
        return new Promise((resolve, reject) => {
            const sql_fav = "SELECT * FROM films WHERE favorite = 1";
            db.all(sql_fav, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map((f) =>
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)
                    ));
                }
            }
            )
        });
    };

    this.watchedToday = () => {
        return new Promise((resolve, reject) => {
            const sql_today = "SELECT * FROM films WHERE watchdate = ?";
            const day = dayjs(new Date()).format('YYYY-MM-DD');
            db.all(sql_today, [day], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map((f) =>
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)));

                }
            })
        });

    };

    this.highEq = (valore) => {
        return new Promise((resolve, reject) => {
            const sql_he = "SELECT * FROM films WHERE rating >= ?";
            db.all(sql_he, [valore], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((f) =>
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)));
            })
        });
    }

    this.title = (name_film) => {
        return new Promise((resolve, reject) => {
            const sql_title = "SELECT * FROM films where title = ?";
            db.all(sql_title, [name_film], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((f) =>
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)));
            })
        });
    }

    this.deleteDates = () => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE films SET watchdate = ?';
            const d = '<not defined>';
            db.run(sql, [d], (err) => {
                if (err) {
                    reject(err);
                    console.log("Update not possible");
                } else {
                    resolve(true);
                    console.log("Watchdate successfully update in table films ");
                }
            });
        });

    }

}



function createFilm(stringa) {
    const lista = stringa.split(", ");

    let id = lista[0].split(": ")[1];
    let title = lista[1].split(': ')[1];
    let favorite = lista[2].split(': ')[1];
    let watch_date;
    let rating;
    let year;

    if (lista.length == 6) {
        watch_date = lista[3].split(': ')[1];
        year = lista[4];
        rating = lista[5].split(': ')[1];
        watch_date = watch_date.concat(", ", year);
    }
    else {
        watch_date = "<not defined>";
        rating = lista[4].split(': ')[1];
    }

    if (isNaN(Number(rating))) {
        rating = "<not assigned>";
    }
    else {
        rating = Number(rating);
    }

    return new Film(id, title, favorite, watch_date, rating);
}


// dichiarazione main
async function main() {

    const films = new FilmLibrary();

    const all_films = await films.all();

    console.log('\nThese are all the films in the database');
    all_films.forEach(f => f.printFilm());

    console.log('\n');

    const favorite_films = await films.favorite();
    const nfavorite = await favorite_films.length;

    if (nfavorite == 0) {
        console.log("There is no film favorite film ");
    } else {
        console.log('Found ', nfavorite, ' favorite films ');
        favorite_films.forEach(f => f.printFilm());
    }




    console.log('');




    let rating = 3;
    const rating_then = await films.highEq(rating);
    const films_rating_hieq = await rating_then.length;

    if (films_rating_hieq == 0) {
        console.log("There is no film rated higher or equal to ", rating);
    } else {
        console.log('Found ', films_rating_hieq, ' rated equal or higher to: ', rating);
        rating_then.forEach(f => f.printFilm());
    }


    let name_film = 'Madagascar penguins';
    const films_title = await films.title(name_film);
    const n_films_title = await films_title.length;

    // films_title.forEach(f => f.printFilm());
    console.log(films_title.length);
    films_title.forEach(f => f.printFilm);


    // testing an insert in table

/*
    try {
        const id = 9;
        await films.delete(id);

    }catch (err){
        console.log("Errore cancellazione film con id = ", id);
    }

*/
    films.delete(12);
    
    try {
        await films.addFilm(new Film(12, 'Madagascar penguins', 1, '2022-03-22', 3));
    } catch (err) {
        console.log("inserimento fallito", err);
    }


    const todays = await films.watchedToday();
    console.log("Films watch today: ");
    todays.forEach(f => f.printFilm());


    // films.deleteDates();
    /*
    const data = new FilmLibrary();
    
    const data_all = await data.all();
    
    data_all.forEach(f => f.printFilm);
    */

    // console.log(dayjs('2022-03-22').isValid());



}





// invoke main here

main();
