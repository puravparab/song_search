"use client"

import { useState, useEffect, useRef} from 'react';
import { FaHistory } from "react-icons/fa";

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

const Search: React.FC<{
	songs: Song[], 
	displayState: State,
	selectedSongs: SongMetadata[], 
	handleSongClick: (song_id: number) => void,
	updateDisplayState: (input: SongMetadata[], genres: string[], num_recs: number, output: SongMetadata[]) => void
}> = ({ 
	songs,
	displayState,
	selectedSongs, 
	handleSongClick,
	updateDisplayState
}) => {
	const [query, setQuery] = useState<string>("");
	
	const [searchResults, setSearchResults] = useState<Song[]>([]); // search results
	const [totalResults, setTotalResults] = useState<number>(0);
	const [highlightedSongsID, setHighlightedSongsID] = useState<number[]>([]);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	
	const [state, setState] = useState<State>(displayState);
	const [history, setHistory] = useState<State[]>([]);
	const [showHistory, setShowHistory] = useState(false);

	useEffect(() => {
		setHighlightedSongsID(selectedSongs.map((song) => song.id));
	}, [selectedSongs])

	// Handle when user types in song query
	const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const numItems = 15;
		const searchQuery = event.target.value;
		setQuery(searchQuery);

		if (searchQuery.trim() === ""){
			setTotalResults(0);
			setSearchResults([]);
		} else {
			const results = songs.filter(song =>
        song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artists.some(artist => artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
        song.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.subgenre.toLowerCase().includes(searchQuery.toLowerCase())
      );
			setTotalResults(results.length)
      setSearchResults(results.slice(0, numItems));
			if (results.length > 0){
				if (showHistory){setShowHistory(false)};
				setShowDropdown(true);
			}
		}
	};

	// Listen if the user clicks out of the search menu
	useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
	// If users clicks outside the search menu
	const handleClickOutside = (event: MouseEvent): void => {
    if (
      searchInputRef.current &&
      !searchInputRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
			setShowHistory(false);
    }
  };
	// If user clicks the search bar
	const handleSearchInputClick = (): void => {
		setShowDropdown(true);
  };

	// Retrieve query history from local storage
	useEffect(() => {
    const storedQueries = localStorage.getItem('displayStateHistory');
    if (storedQueries) {
      setHistory(JSON.parse(storedQueries));
    }
	}, [displayState])
	// Update display state when user clicks on item in history
	const handleHistoryClick = (state: State): void => {
		updateDisplayState(state.input, state.genres, state.num_recs, state.output)
	};
	// Show history
	const handleShowHistory = (): void => {
		if (showDropdown){setShowDropdown(false)};
		setShowHistory(!showHistory);
	};
	const handleClearHistory = () => {
		setHistory([]);
		localStorage.removeItem('displayStateHistory');
		setShowHistory(false);
	};
	
	return (
		<div 
			ref={searchInputRef} 
			className="w-full flex flex-col justify-start items-center"
		>
			<div className="w-full flex flex-row items-center mb-2
				border rounded-lg border-zinc-300 dark:border-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-700 
				dark:bg-black bg-slate-100">
				<input
					type="text"
					placeholder="Add songs..."
					value={query}
					onChange={handleQueryChange}
					onClick={handleSearchInputClick}
					className="
						w-full mx-4 my-2 text-base text-black placeholder:text-zinc-500 
						focus:ring-0 bg-slate-100 dark:bg-black dark:text-stone-100 focus:outline-none"
				/>
				<div className="px-2 py-2 cursor-pointer" onClick={handleShowHistory}>
					<FaHistory/>
				</div>
			</div>
			
			{/* Show history */}
			{(showHistory && history.length > 0) && (
        <>
					<span onClick={handleClearHistory} className="text-sm ml-auto my-1 cursor-pointer dark:text-zinc-100 hover:dark:text-zinc-200">
						clear
					</span>

					<ul className="
						w-full rounded-lg shadow-lg
						dark:bg-zinc-800 bg-slate-100
					">
						
						{history.slice().reverse().map((query, index) => (
							<li 
								key={index} onClick={() => handleHistoryClick(query)}
								className="flex flex-row flex-wrap gap-x-4 py-2 px-3 border-b hover:border-0 border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm hover:bg-green-200 hover:dark:bg-emerald-700 cursor-pointer"
							>
								{query.input.slice().reverse().map((item, itemIndex) => (
									<div key={itemIndex} className="flex flex-row flex-wrap">
										<span  className="pr-2 dark:text-zinc-100 text-zinc-500">{item.name}</span>
										<span className="dark:text-zinc-400 text-zinc-500">{item.artists.join(', ')}</span>
									</div>
								))}
							</li>
						))}
					</ul>
				</>
      )}

			{/* Show search results */}
			{showDropdown && (
				<>
					<ul className="
						w-full rounded-lg shadow-lg
						dark:bg-zinc-800 bg-slate-100
					">
						{searchResults.map(song => {
							const isSelected = highlightedSongsID.includes(song.id);
							return (
							<li 
								key={song.id} onClick={() => {
									if (!isSelected){setHighlightedSongsID((prevState) => [...prevState, song.id])}
									handleSongClick(song.id)
								}}
								className={`py-2 px-3 text-xs sm:text-sm hover:bg-green-200 cursor-pointer ${
									isSelected ? 'dark:bg-emerald-700 hover:dark:bg-emerald-700 hover:bg-green-200 bg-green-200' : 'dark:hover:bg-emerald-700 dark:text-zinc-100'
								}`}
							>
								<span className="pr-2 dark:text-zinc-100">{song.name}</span>
								<span className="dark:text-zinc-400 text-zinc-500">{song.artists.join(', ')}</span>
							</li>
							)
						})}
					</ul>
					
					{(totalResults > 0)&& (
						<p className="mt-2 mr-auto text-sm dark:text-zinc-400">
							Displaying {searchResults.length} of {totalResults} results
						</p>
					)}
				</>
			)}
		</div>
	);
};

export default Search;