"use client"

import { useState, useEffect } from 'react';

import Search from './components/search';
import Display from './components/display';
import { parseSongCSV } from './utils';

interface Song {
  id: number;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

const Home: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  // Retrieve song metadata from /songs.csv
  const fetchSongs = async () => {
    const csvData = await fetch('songs.csv').then(response => response.text());
    const parsedSongs = await parseSongCSV(csvData);
    setSongs(parsedSongs)
    setSelectedSongs([parsedSongs[1085], parsedSongs[2430]]);
  };

  // If user clicks a songs
	const handleSongClick = (song: Song): void => {
    if (selectedSongs.includes(song)){
      setSelectedSongs((selectedSongs) =>{
        return selectedSongs.filter(ssItem => ssItem !== song)
      })
    } else{
      setSelectedSongs((selectedSongs) => [...selectedSongs, song]);
    }
	}

  // Get metadata of requested songs
  const getMetadata = (song_ids: number[]): Song[] => {
    return songs.filter(song => song_ids.includes(song.id));
  };

  return (
    <main 
      className="
        dark:bg-zinc-950 dark:text-stone-100 bg-stone-200 text-black 
        flex min-h-screen flex-col items-center justify-start 
        py-5 md:px-10 px-5"
    >
      <h1 className="text-2xl text-bold">Song Search</h1>
      <p></p>

      <div className="lg:w-7/12 md:w-8/12 w-11/12 my-6">
        <Search songs={songs} selectedSongs={selectedSongs} handleSongClick={handleSongClick}/>
      </div>

      <div className="md:w-full w-11/12 my-5">
        <Display selectedSongs={selectedSongs} handleSongClick={handleSongClick} getMetadata={getMetadata}/>
      </div>
      
    </main>
  );
}

export default Home;