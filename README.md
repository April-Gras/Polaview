# Polaview

A media library that is built more around the people that are going to use it than the content itself.
This project is in developement and is only suited for personal use. I also use it to have something to put on my resume other than "I worked tirelesly at company `X` for `n` years"

If you're looking for an actual media library that is not in constant WIP state, you should check out [Plex](https://www.plex.tv/fr/) or [Jellyfin](https://jellyfin.org/)

### Implemented features
- Pattern matching functions to match a file name to an actual show or movie
- Multithreaded file to entity matching
- Redis cache to limit API requests to TvDb
- Mobile first client to watch the medias
- Admin view to manage users and access
- 2 languages supported for now (french / english)
- Multi lang show / movie overviews powered by TvDb
- Cast + Writer + Director Info
- Role attributions for the cast
- A questionable mascot

And a bunch more on the way. Don't expect me to keep this list up to date in any way.

### Requirements
- TvDb Apiv4 access

- docker/-compose
- npm
- potencially Nvidea docker stuff, but don't count on me to document that for now

### Run
```sh
npm i
docker-compose build
docker-compose up -d
```

By default your local `~/${USER}/Video` folder will be used as the only source for the media you want to expose.
