import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

const genreColor: { [key: string]: string } = {
  'pop': 'bg-green-700 dark:bg-green-600 hover:opacity-100',
  'rap': 'bg-blue-700 dark:bg-blue-600 hover:opacity-100',
  'rock': 'bg-red-700 dark:bg-red-600 hover:opacity-100',
  'latin': 'bg-pink-700 dark:bg-pink-600 hover:opacity-100',
  'r&b': 'bg-amber-700 dark:bg-amber-600 hover:opacity-100',
  'edm': 'bg-violet-700 dark:bg-violet-600 hover:opacity-100',
	'': 'bg-emerald-700 dark:bg-emerald-700 hover:opacity-100'
};

interface DisplayProps {
  displayState: {
    input: SongMetadata[];
    genres: string[];
    num_recs: number;
    output: SongMetadata[];
  };
  handleSongClick: (song_id: number) => void;
  addRandomSong: () => void;
	getMetadata: (song_ids: number[]) => Song[];
	updateDisplayState: (input: SongMetadata[], genres: string[], num_recs: number, output: SongMetadata[]) => void
	saveDisplayState: (input: SongMetadata[], genres: string[], num_recs: number, output: SongMetadata[]) => void;
}

const Display: React.FC<DisplayProps> = ({
	displayState, 
	handleSongClick, 
	addRandomSong,
	getMetadata,
	updateDisplayState,
	saveDisplayState
}) => {
	// Current Display state
	const [inputSongs, setInputSongs] = useState<SongMetadata[]>([]) // songs in the input
	const allGenres = ['pop', 'rap', 'rock', 'latin', 'r&b', 'edm']; // default genres included
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]); // selected genres
  const [numRecs, setNumRecs] = useState<number>(displayState.num_recs); // number of recommendations
	
	const [displaySongs, setDisplaySongs] = useState<SongMetadata[]>([]); // stores recommended songs returned from api

	const [requestText, setRequestText] = useState<string>(""); // displayed when user clicks the get recommendation button

	const audioRef = useRef<HTMLAudioElement | null>(null); // audio element

	const [isMobile, setIsMobile] = useState<boolean>(false); // check if mobile view

	useEffect(() => {
		setInputSongs(displayState.input);
		setSelectedGenres(displayState.genres);
		setNumRecs(displayState.num_recs);
		setDisplaySongs(displayState.output);
	}, [displayState]);

	// If user clicks on one of the input songs
	const handleRemoveSong = (song_id: number) => {
    handleSongClick(song_id); // call function from parent
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
			
			const startTime = Date.now();
			const response = await axios.post(process.env.NEXT_PUBLIC_LAMBDA || "", requestData, {headers: {'Content-Type': 'application/json'}});
    	const duration = Date.now() - startTime; // Store the duration(ms) in state

			if (response.status === 200) {
				const data = response.data;
				if (data && data.songs) {
						const output = processRecommendedSongs(data.songs)
						updateDisplayState(inputSongs, selectedGenres, numRecs, output);
						saveDisplayState(inputSongs, selectedGenres, numRecs, output);
						setRequestText(`(${duration/1000} seconds)`);
				} else {
					console.error('Invalid response format: missing "songs" property');
					setTimeout(() => {setRequestText("try again");}, 2000);
				}
			} else {
				console.error('Request failed with status:', response.status);
				console.error('Response data:', response.data);
				setTimeout(() => {setRequestText("try again");}, 2000);
			}
		} catch (error) {
			console.error('Error:', error);
			setTimeout(() => {setRequestText("try again");}, 2000);
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
				track_id: local_song?.track_id || song.track_id,
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
				<h2 className="text-lg">01. Select songs: <span className='ml-2 p-1 cursor-pointer text-lg' onClick={addRandomSong}>🎲</span></h2>
				<p className="text-base text-black dark:text-zinc-600">
					- Search and add one or more songs.
					<br/>
					- Click on song to remove it.
					<br />
					- Hover over a song to listen to it.
				</p>
				<div className="flex flex-row flex-wrap gap-4 mt-4 w-full">
					{inputSongs.length !== 0 && inputSongs.map(song => {
						const inputSong = inputSongs.find(s => s.id === song.id);
						if(inputSong){
							let bgColor = genreColor[song.genre || '']
							return (
								<div 
									key={song.id} onClick={() => {handleRemoveSong(song.id)}}
									onMouseEnter={() => handleMouseEnter(inputSong.preview_url)}
									onMouseLeave={handleMouseLeave}
									className={`flex flex-row py-2 pl-2 pr-4 w-fit rounded-full text-xs cursor-pointer opacity-100 hover:opacity-90 dark:opacity-90 dark:hover:opacity-100 ${bgColor}`}
								>	
									<img src={inputSong.image_url || ""} width="32px" height="32px" className="rounded-full m-auto mr-2"/>
									<div className="flex flex-col">
										<span className="text-zinc-100 dark:text-zinc-100">{inputSong.name}</span>
										<span className="text-zinc-200 dark:text-zinc-300">{inputSong.artists.join(', ')}</span>
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
				<p className="text-base dark:text-zinc-600">
					- Select genres you want to include.
					<br/>
					- Choose number of recommendations.
					<br />
					- Click on a genre to remove it
				</p>
				<div className="flex flex-row flex-wrap gap-5 mt-4 p-5 items-start justify-start border rounded-lg border-zinc-300 dark:border-zinc-800">
					<div className="w-full flex flex-col">
						<label className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">Select Genres</label>
						<select className="
							flex flex-col w-20 mt-1 mb-3 py-1 px-1 rounded border text-md focus:ring-0 outline-none
							border-zinc-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950"
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
											${genreColor[genre]} opacity-90 text-zinc-100 dark:text-white
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
						onClick={() => {
							setRequestText("Finding similar songs for you...");
							handleGetRecommendations();
							setTimeout(() => {setRequestText("running cosine similarity...");}, 2000);
						}}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none">
						Get Recommendations
					</button>
					{requestText !== "" && (
						<p className="mt-2 mx-auto text-sm text-zinc-500">
							{requestText}
						</p>
					)}
				</div>

			</div>

			{/* 03. Your Recommendations */}
			<div className="w-full mb-3 md:px-4 lg:px-14">
				<h2 className="text-lg">03. Your Recommendations:</h2>
				<p className="text-base dark:text-zinc-600">
					- Click on get recommendations.
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
									onClick={() => {
										if (song.track_url){window.open(song.track_url, '_blank');}}}
									className={`flex flex-row py-2 pl-2 pr-4 w-fit rounded-full text-xs cursor-pointer opacity-100 hover:opacity-90 dark:opacity-90 dark:hover:opacity-100 ${genreColor[song.genre || '']}`}
								>	
									<img src={song.image_url || ""} width="32px" height="32px" className="rounded-full m-auto mr-2"/>
									<div className="flex flex-col">
										<span className="text-zinc-100 dark:text-zinc-100">{song.name}</span>
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