import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Song {
  id: number;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

interface SongMetadata {
	id: number;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
	preview_url: string;
	track_url: string;
	image_url: string;
}

const genreColor: { [key: string]: string } = {
  'pop': 'bg-green-600 hover:opacity-100',
  'rap': 'bg-blue-600 hover:opacity-100',
  'rock': 'bg-red-600 hover:opacity-100',
  'latin': 'bg-pink-600 hover:opacity-100',
  'r&b': 'bg-amber-600 hover:opacity-100',
  'edm': 'bg-violet-600 hover:opacity-100',
	'': 'bg-emerald-700 hover:opacity-100'
};

const Display: React.FC<
	{selectedSongs: Song[], handleSongClick: (song: Song) => void, getMetadata: (song_ids: number[]) => Song[], addRandomSong: () => void}> = (
	{selectedSongs, handleSongClick, getMetadata, addRandomSong}) => {
	
	// Current Display state
	const [inputSongs, setInputSongs] = useState<SongMetadata[]>([]) // songs in the input
	const allGenres = ['pop', 'rap', 'rock', 'latin', 'r&b', 'edm']; // default genres included
  const [selectedGenres, setSelectedGenres] = useState<string[]>(allGenres); // selected genres
  const [numRecs, setNumRecs] = useState<number>(25); // number of recommendations
	const [displaySongs, setDisplaySongs] = useState<SongMetadata[]>([]); // stores recommended songs returned from api

	const audioRef = useRef<HTMLAudioElement | null>(null); // audio element

	const [isMobile, setIsMobile] = useState<boolean>(false); // check if mobile view

	// INPUT SONGS
	// Run whenver user adds a new song
	useEffect(() => {
		// process new songs if they are not included in current input
		const newSongs: Song[] = selectedSongs.filter(song =>
			!inputSongs.some(inputSong => inputSong.id === song.id)
		);
		if (newSongs.length > 0) {
			fetchSongMetadata(newSongs)
				.then(data => {
					// use local and external metadata
					setInputSongs(prevSongs => [...prevSongs, ...processInputSongs(data, newSongs)]);
				})
				.catch(error => {
					console.error('Error processing new songs:', error);
					// user only local metadata
					setInputSongs(prevSongs => [...prevSongs, ...processInputSongs(null, newSongs)]);
				});
		}
	}, [selectedSongs, inputSongs]);

	// If user clicks on one of the input songs
	const handleRemoveSong = (song: Song) => {
  	setInputSongs(prevSongs => prevSongs.filter(s => s.id !== song.id)); // remove song from input
    handleSongClick(song); // call function from parent
  };

	// AUDIO
	useEffect(() => {
		// Check if user is using a mobile device
		const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Check initial screen width

		// process audio previews
    const audio = new Audio();
    audioRef.current = audio;
    window.addEventListener('resize', handleResize);
    return () => {
      audio.pause();
      audioRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, []);
	// user hovers over a song
	const handleMouseEnter = (previewUrl: string) => {
    if (!isMobile && audioRef.current) {
      audioRef.current.src = previewUrl;
      audioRef.current.play();
    }
  };
	// user hovers out of the song
  const handleMouseLeave = () => {
    if (!isMobile && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

	// Customize recommendation options
	const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedGenre = event.target.value;
		// User opts to include all genres
		if (selectedGenre === "all") {setSelectedGenres(allGenres);} 
		else {
			// if genre is present remove it
			if (selectedGenres.includes(selectedGenre)) {removeGenre(selectedGenre)}
			// add genre
			else {setSelectedGenres([...selectedGenres, selectedGenre]);}
		}
	};
	// remove a genre from included genres
	const removeGenre = (genre: string): void => {
		setSelectedGenres(selectedGenres.filter(g => g !== genre));
	};
	// update number of recommendations
	const handleNumRecsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setNumRecs(parseInt(event.target.value));
	};

	// EXTERNAL API
	// Get song(s) metadata from the api
	const fetchSongMetadata = async (songs: Song[]) => {
		try {
			const songIds: number[] = songs.map(song => song.id);
			const requestData = {
				type: 'metadata',
				songs: songIds,
				genres: selectedGenres,
				topk: numRecs
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
				trackId: song.trackId,
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

	// Get recommendations from the API
	const handleGetRecommendations = async () => {
		try {
			const songIds: number[] = inputSongs.map(song => song.id);
			const requestData = {
				type: 'recs',
				songs: songIds,
				genres: selectedGenres,
				topk: numRecs
			};
			const response = await axios.post(process.env.NEXT_PUBLIC_LAMBDA || "", requestData, {headers: {'Content-Type': 'application/json'}});

			if (response.status === 200) {
				const data = response.data;
				if (data.songs) {
						setDisplaySongs(processRecommendedSongs(data.songs));
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
	}
	// create metadata for each song using mix of local and external metadata
	const processRecommendedSongs = (data: SongMetadata[]): SongMetadata[] => {
		const songIds = data.map(song => song.id);
  	const local_metadata = getMetadata(songIds); // call parent function to get local metadata
		const res: SongMetadata[] = data.map(song => {
			const local_song = local_metadata.find(s => s.id === song.id);
			return {
				id: song.id,
				trackId: song.trackId,
				name: song.name,
				artists: song.artists,
				genre: local_song?.genre || '',
				subgenre: local_song?.subgenre || '',
				preview_url: song.preview_url,
				track_url: song.track_url,
				image_url: song.image_url,
			};
		});
		return res;
	};

	return (
		<div className="w-full flex md:flex-row md:justify-evenly flex-col items-start gap-6">
			{/* 01. Select songs */}
			<div className="w-full mb-3 md:pl-4 md:pr-0">
				<h2 className="text-lg">01. Select songs:</h2>
				<p className="text-base dark:text-zinc-700">
					- Search and add one or more songs <span className='ml-2 p-1 cursor-pointer text-lg' onClick={addRandomSong}>🎲</span>
					<br/>
					- Click on song to remove it.
					<br />
					- Hover over a song to listen to it.
				</p>
				<div className="flex flex-row flex-wrap gap-4 mt-4 w-full">
					{inputSongs.length !== 0 && selectedSongs.map(song => {
						const inputSong = inputSongs.find(s => s.id === song.id);
						if(inputSong){
							let bgColor = genreColor[song.genre || '']
							return (
								<div 
									key={song.id} onClick={() => {handleRemoveSong(song)}}
									onMouseEnter={() => handleMouseEnter(inputSong.preview_url)}
									onMouseLeave={handleMouseLeave}
									className={`flex flex-row py-2 pl-2 pr-4 w-fit rounded-full text-xs cursor-pointer opacity-90 ${bgColor}`}
								>	
									<img src={inputSong.image_url || ""} width="32px" height="32px" className="rounded-full m-auto mr-2"/>
									<div className="flex flex-col">
										<span className="dark:text-zinc-100">{inputSong.name}</span>
										<span className="dark:text-zinc-300 text-zinc-500">{inputSong.artists.join(', ')}</span>
									</div>
								</div>
							);
						}
					})}
				</div>
			</div>

			{/* 02. Customize: */}
			<div className="w-full mb-3">
				<h2 className="text-lg">02. Customize:</h2>
				<p className="text-base dark:text-zinc-700">
					- Select genres you want to include.
					<br/>
					- Choose number of recommendations.
					<br />
					- Click on a genre to remove it
				</p>
				<div className="flex flex-row flex-wrap gap-5 mt-4 p-5 items-start justify-start border rounded-lg dark:border-zinc-800">
					<div className="w-full flex flex-col">
						<label className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">Select Genres</label>
						<select className="
							flex flex-col w-20 mt-1 mb-3 py-1 px-1 rounded border text-md focus:ring-0 outline-none
							dark:border-zinc-800 dark:bg-zinc-950"
							onChange={handleGenreChange}
              value=""
						>
							<option value=""></option>
							<option value="all">All</option>
							<option value="pop">Pop</option>
							<option value="rap">Rap</option>
							<option value="rock">Rock</option>
							<option value="latin">Latin</option>
							<option value="r&b">R&B</option>
							<option value="edm">Edm</option>
						</select>
						<div className="lg:w-fit flex flex-wrap gap-2 mb-4">
							{selectedGenres.map(genre => {
								return (
									<div
										key={genre}
										className={`
											px-3 py-1 rounded-lg text-sm font-medium cursor-pointer
											${genreColor[genre]} opacity-90 dark:text-white
										`}
										onClick={() => removeGenre(genre)}
									>
										{genre}
									</div>
								);
							})}
            </div>
					</div>
					<div className="lg:w-auto w-full flex flex-col">
            <label className="mb-5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Number of Recommendations: {numRecs}
            </label>
            <input
              type="range"
              min="10"
              max="40"
              step="1"
              value={numRecs}
              onChange={handleNumRecsChange}
              className="slider lg:w-full w-52 h-3 rounded-lg cursor-pointer accent-green-500 dark:bg-zinc-950"
            />
						<div className="lg-full w-52 flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-1">
							<span>10</span>
							<span>40</span>
						</div>
          </div>
        </div>
				
				<div className="flex flex-col sm:items-center mt-10">
					<button 
						onClick={handleGetRecommendations}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none">
						Get Recommendations
					</button>
				</div>

			</div>

			{/* 03. Your Recommendations */}
			<div className="w-full mb-3 md:px-4 lg:px-14">
				<h2 className="text-lg">03. Your Recommendations:</h2>
				<p className="text-base dark:text-zinc-700">
					- You song recommendations are displayed below.
					<br/>
					- Hover over a song to listen to it.
					<br />
					- Click on song to go to its spotify page.
				</p>
				<div className="flex flex-row flex-wrap gap-4 mt-4 mb-3 w-full">
					{displaySongs.length !== 0 && displaySongs.map(song => {
						if (song){
							return (
								<div 
									key={song.id}
									onMouseEnter={() => handleMouseEnter(song.preview_url)}
									onMouseLeave={handleMouseLeave}
									className={`flex flex-row py-2 pl-2 pr-4 w-fit rounded-full text-xs cursor-pointer opacity-90 ${genreColor[song.genre || '']}`}
								>	
									<img src={song.image_url || ""} width="32px" height="32px" className="rounded-full m-auto mr-2"/>
									<div className="flex flex-col">
										<span className="dark:text-zinc-100">{song.name}</span>
										<span className="dark:text-zinc-300 text-zinc-200">{song.artists.join(', ')}</span>
									</div>
								</div>
						);}
					})}
				</div>
			</div>

		</div>
	);
};

export default Display;