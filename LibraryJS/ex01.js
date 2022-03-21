'use strict';
const dayjs = require('dayjs') ;


var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
var localizedFormat = require('dayjs/plugin/localizedFormat');

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);



const sqlite = require('sqlite3');
const db = new sqlite.Database('./films.db', (err) => { 
    if (err){
        throw err; 
    }
});


function Film(id,title, favorite, watchDate, score){    
    this.id = id;
    this.title = title;
    this.favorite = favorite;
    this.date = "<not defined>";
// allowed to use an empty string "" for the date and the 

    if ( dayjs(watchDate).isValid())
        this.date = dayjs(watchDate).format('YYYY-MM-DD');
    else{
        this.date = "<not defined>";
    }
    
    this.score = score;

    this.printFilm= function(){
//        Id: 1, Title: Pulp Fiction, Favorite: true, Watch date: March 10, 2022, Score: 5
        console.log("Id: %d, Title: %s, Favorite: %s, Watch date: %s, Score: %s", id, title, favorite, watchDate, score );
    }

}


function FilmLibrary(){
    this.library = [];

    this.addFilm = function(film){
        this.library.push(film);
    }



    this.deleteFilm = function(id){

        library = library.filter(x => {
            return  x.id.toString() !== id.toString();
        })
    }

    this.getRated = function(){
        let i = 0;
        console.log('***** Films filtered, only the rated ones *****');
        library.filter(film => isNaN(Number(film.score)) == false )
        .forEach(e => {
            e.printFilm()
            i = i+1;
        });

        if(i==0)
            console.log("\t\t->There are not films rated yet<-");
    }

    this.printAll = function(){
        this.library.forEach(element => element.printFilm());

    }

    this.sortByDate = () =>{

        this.library.sort(function(a,b){
            if(dayjs(a.date).isSameOrBefore(b.date) || dayjs(b.date).isValid() == false)
                return -1;
            
            else 
                return 1;   
        });
    }

    this.resetWatchedFilms = () => {
        this.library.forEach((film) => film.date = ''); 
        
    } 


this.all = () => {
        return new Promise((resolve, reject) =>{
            const sql_all = "SELECT * FROM films";  

            db.all(sql_all, (err, rows) => {
                if(err){
                    reject(err);
                }else{
                     resolve(rows.map((f) => 
                        new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)
                    ));
                }
            });
        });
    };
this.favorite= () => {
        return new Promise((resolve, reject) => {
            const sql_fav = "SELECT * FROM films WHERE favorite = 1";
            db.all(sql_fav, (err, rows) => {
                if(err)
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
    return new Promise((resolve, reject) =>{
        const sql_today = "SELECT * FROM films WHERE watchdate = ?";
        const day = dayjs('2022-03-21').format('YYYY-MM-DD');
        db.all(sql_today, [day], (err, rows) => {
            if(err)
                reject(err);
            else 
                resolve(rows.map((f) => 
                new Film(f.id, f.title, f.favorite, f.watchdate, f.rating)));
        })
    });

}
}


function createFilm(stringa){
    const lista = stringa.split(", ");

    let id = lista[0].split(": ")[1]; 
    let title = lista[1].split(': ')[1];
    let favorite = lista[2].split(': ')[1];
    let watch_date;
    let score;
    let year;

    if(lista.length == 6){
        watch_date = lista[3].split(': ')[1];
        year = lista[4];
        score = lista[5].split(': ')[1];
        watch_date = watch_date.concat(", ", year);
    }
    else {
        watch_date = "<not defined>";
        score = lista[4].split(': ')[1];
    }

    if(isNaN(Number(score))){
      score = "<not assigned>";
    }
    else {
        score = Number(score);
    }

    return new Film(id, title, favorite, watch_date, score);
}




// dichiarazione main
async function main(){

const ff = new FilmLibrary();

const all_ff = await ff.all();
//console.log(all_ff);

const favorite_ff = await ff.favorite();
console.log(favorite_ff);

const today_ff = await ff.watchedToday();
console.log('Found ', today_ff.length,' films watched today: \n',  today_ff);


console.log('\n');

for (let x of favorite_ff){
   x.printFilm();
}

// var all_films = new FilmLibrary();

}


main();
