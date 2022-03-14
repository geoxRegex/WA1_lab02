'use strict';
const dayjs = require('dayjs') ;


var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
var localizedFormat = require('dayjs/plugin/localizedFormat');

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);
function Film(id,title, favorite, date, score){    
    this.id = id;
    this.title = title;
    this.favorite = favorite;
    
// allowed to use an empty string "" for the date and the 

    if (date === "<not defined>")
        this.date = "<not defined>";
    else
        this.date = date;
    
    this.score = score;

    this.printFilm= function(){
//        Id: 1, Title: Pulp Fiction, Favorite: true, Watch date: March 10, 2022, Score: 5
        console.log("Id: %d, Title: %s, Favorite: %s, Watch date: %s, Score: %s", id, title, favorite, date, score );
    }
    this.resetDate = function(){
        this.date = "<not defined>";
    }

}


function FilmLibrary(){
    let library = [];

    this.addFilm = function(film){
        return library.push(film);
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
        library.forEach(element => element.printFilm());

    }

    this.sortByDate = function(){

        library.sort(function(a,b){
            if(dayjs(a.date).isSameOrBefore(b.date) || dayjs(b.date).isValid() == false)
                return -1;
            
            else 
                return 1;   
        });
    }

    this.resetWatchedFilms = function(){
        library.forEach(x => x.resetDate());
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


const temp_str = "Id: 1, Title: Pulp Fiction, Favorite: true, Watch date: March 30, 2022, Score: 5\nId: 2, Title: 21 Grams, Favorite: true, Watch date: March 17, 2022, Score: 4\nId: 3, Title: Star Wars, Favorite: false, Watch date: <not defined>, Score: <not assigned>\nId: 4, Title: Matrix, Favorite: false, Watch date: <not defined>, Score: <not assigned>\nId: 5, Title: Shrek, Favorite: false, Watch date: March 21, 2022, Score: 3";

const list = temp_str.split("\n");


 let films = new FilmLibrary();

let film = new Film();
 for (let x of list){
    films.addFilm(createFilm(x));
 }

// deleteFilm perfettamente funzionante
//films.deleteFilm(3);


films.sortByDate();

//films.getRated();

//films.resetWatchedFilms();

// films.printAll();

films.getRated();

// deletes the film with the id assigned as argument from the list of films
//films.deleteFilm(3);<
