"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';

import Search from './components/search';
import Display from './components/display';
import { parseSongCSV } from './utils';

interface Song {
  id: number;
  track_id: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

interface SongMetadata {
	id: number;
  track_id: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
	preview_url: string;
	track_url: string;
	image_url: string;
}

interface State {
	input: SongMetadata[];
	genres: string[];
	num_recs: number;
	output: SongMetadata[];
}

const Home: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
	const [displayState, setDisplayState] = useState<State>({
    input: [],
    genres: ["pop", "rap", "rock", "latin", "r&b", "edm"],
    num_recs: 25,
    output: [],
  });

  useEffect(() => {
    fetchSongs(); // Fetch local metadata data from songs.csv
		fetchState(); // Fetch display state from local storage or default_state.json
  }, []);

  // Retrieve song metadata from /songs.csv
  const fetchSongs = async () => {
    const csvData = await fetch('songs.csv').then(res => res.text());
    const parsedSongs = await parseSongCSV(csvData);
    setSongs(parsedSongs);
  };

	// Fetch previous display state or default state
	const fetchState = async () => {
		try {
			const history = JSON.parse(localStorage.getItem('displayStateHistory') || '[]');
			if (history.length > 0) {
				setDisplayState(history[history.length - 1]);
			} else {
				const response = await fetch('default_state.json');
				const state: State = await response.json();
				setDisplayState(state);
			}
		} catch (error) {
			console.error('Error fetching display state:', error);
		}
	}

  // If user clicks on a song (search bar)
	const handleSongClick = async (song_id: number): Promise<void> => {
		const song = songs.find((s) => s.id === song_id);
		if (song) {
			setDisplayState((prevState) => {
				const inputExists = prevState.input.some((inputSong) => inputSong.id === song_id);
				if (inputExists) {
					// Remove the song from input if it already exists
					const updatedInput = prevState.input.filter((inputSong) => inputSong.id !== song_id);
					return { ...prevState, input: updatedInput };
				} else {
					// Add the song to input if it doesn't exist
					return { ...prevState };
				}
			});
	
			if (!displayState.input.some((inputSong) => inputSong.id === song_id)) {
				try {
					const data = await fetchSongMetadata([song]);
					// use local and external metadata
					const updatedInput = processInputSongs(data, [song]);
					setDisplayState((prevState) => ({ ...prevState, input: [...prevState.input, ...updatedInput] }));
				} catch (error) {
					console.error('Error processing new songs:', error);
					// use only local metadata
					const updatedInput = processInputSongs(null, [song]);
					setDisplayState((prevState) => ({ ...prevState, input: [...prevState.input, ...updatedInput] }));
				}
			}
		}
	};

  // Get local metadata of requested song ids
  const getMetadata = (song_ids: number[]): Song[] => {
    return songs.filter(song => song_ids.includes(song.id));
  };

	// Add random song
	const addRandomSong = () => {
		if (songs.length > 0) {
			let randomSong: Song;
			const inputSongIds = displayState.input.map((song) => song.id);
			do {
				const randomIndex = Math.floor(Math.random() * songs.length);
				randomSong = songs[randomIndex];
			} while (inputSongIds.includes(randomSong.id));
	
			fetchSongMetadata([randomSong])
				.then(data => {
					// use local and external metadata
					const updatedInput = processInputSongs(data, [randomSong]);
					setDisplayState((prevState) => ({
						...prevState,
						input: [...prevState.input, ...updatedInput],
					}));
				})
				.catch(error => {
					console.error('Error processing random song:', error);
					// use only local metadata
					const updatedInput = processInputSongs(null, [randomSong]);
					setDisplayState((prevState) => ({...prevState,input: [...prevState.input, ...updatedInput]}));
				});
		};
	};

	// EXTERNAL API
	// Get song(s) metadata from the api
	const fetchSongMetadata = async (songs: Song[]) => {
		try {
			const songIds: number[] = songs.map(song => song.id);
			const requestData = {
				type: 'metadata',
				songs: songIds,
			};
			const response = await axios.post(process.env.NEXT_PUBLIC_LAMBDA || "", requestData, {
				headers: {'Content-Type': 'application/json'}
			});
			if (response.status === 200) {
				const data = response.data;
				if (data.songs) {
					return data.songs;
				} else {
					console.error('Invalid response format: missing "songs" property');
				}
			} else {
				console.error('Request failed with status:', response.status);
				console.error('Response data:', response.data);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	};
	// create metadata for each song using mix of local and external metadata
	const processInputSongs = (data: SongMetadata[] | null, newSongs: Song[]) => {
		const newSongMetadata: SongMetadata[] = newSongs.map(song => {
			const apiData = data?.find(apiSong => apiSong.id === song.id);
			return {
				id: song.id,
				track_id: song.track_id,
				name: song.name,
				artists: apiData?.artists || song.artists,
				genre: song.genre,
				subgenre: song.subgenre,
				preview_url: apiData?.preview_url || "",
				track_url: apiData?.track_url || "",
				image_url: apiData?.image_url || "",
			};
		});
		return newSongMetadata
	};

	// Update display state from child component
	const updateDisplayState = (input: SongMetadata[], genres: string[], num_recs: number, output: SongMetadata[]): void => {
		setDisplayState({
			input: input,
			genres: genres,
			num_recs: num_recs,
			output: output
		})
	}

	// Save current display state to local storage
	const saveDisplayState = (input: SongMetadata[], genres: string[], num_recs: number, output: SongMetadata[]) => {
		const state: State ={
			input: input,
			genres: genres,
			num_recs: num_recs,
			output: output
		}
		try {
			const history = JSON.parse(localStorage.getItem('displayStateHistory') || '[]');
			history.push(state);
			localStorage.setItem('displayStateHistory', JSON.stringify(history));
		} catch (error) {
			console.error('Error saving display state to local storage:', error);
		}
	};

  return (
    <main 
      className="
			bg-slate-100 dark:bg-zinc-950 text-black dark:text-stone-100  
        flex min-h-screen flex-col items-center justify-start 
        py-5 md:px-10 px-5"
    >
      <h1 className="text-2xl text-bold">Song Search</h1>
      <p></p>

      {/* Search Bar */}
      <div className="lg:w-7/12 md:w-8/12 w-11/12 my-6">
        <Search 
					songs={songs} 
					displayState={displayState}
					selectedSongs={displayState.input} 
					handleSongClick={handleSongClick}
					updateDisplayState={updateDisplayState}
				/>
      </div>

      {/* Main Display */}
      <div className="md:w-full w-11/12 my-5">
        <Display 
          displayState={displayState} 
          handleSongClick={handleSongClick}
          addRandomSong={addRandomSong}
					getMetadata={getMetadata}
					updateDisplayState={updateDisplayState}
					saveDisplayState={saveDisplayState}
        />
      </div>
      
    </main>
  );
}

export default Home;