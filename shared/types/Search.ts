/**
 * when scrapping for search results on imdb we can give the engine some precision as to what we are looking for
 * Either a TvSerie or a Movie
 * The associated `ft` and `tv strings are what we supply to the imdb query
 */
export enum SearchType {
  movie = "ft",
  TV = "tv",
}
