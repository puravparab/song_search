"use client"

import { useState, useEffect, useRef} from 'react';

interface Song {
  id: string;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

const Search: React.FC<{songs: Song[], selectedSongs: Song[], handleSongClick: (song: Song) => void}> = ({ songs, selectedSongs, handleSongClick}) => {
	const [query, setQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<Song[]>([]);
	const [totalResults, setTotalResults] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [showDropdown, setShowDropdown] = useState(false);

	// Handle when user types in song query
	const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const numItems = 15;
		const searchQuery = event.target.value;
		setQuery(searchQuery);

		if (searchQuery.trim() === ""){
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
				setShowDropdown(true);
			}
		}
	};

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
    }
  };
  
	// If user clicks the search bar
	const handleSearchInputClick = (): void => {
		setShowDropdown(true);
  };
	
	return (
		<div 
			ref={searchInputRef} 
			className="w-full flex flex-col justify-start items-center"
		>
			<input
        type="text"
        placeholder="Add songs ..."
				value={query}
				onChange={handleQueryChange}
				onClick={handleSearchInputClick}
        className="
					w-full px-4 py-2 border rounded-lg placeholder:text-zinc-500 text-base focus:ring-1
					dark:bg-zinc-800 dark:border-zinc-800 dark:focus:ring-zinc-800 dark:text-stone-100
					bg-white border-zinc-300 focus:outline-none focus:ring-zinc-500 text-black" 
      />
			{showDropdown && (
				<ul className="
					w-full mt-2 rounded-lg shadow-lg
					dark:bg-zinc-800 bg-stone-100
				">
          {searchResults.map(song => {
						const isSelected = selectedSongs.includes(song);
						return (
						<li 
							key={song.id} onClick={() => {handleSongClick(song)}}
							className={`py-2 px-3 text-sm hover:bg-gray-300 cursor-pointer ${
								isSelected ? 'dark:bg-emerald-700 hover:dark:bg-emerald-700 hover:bg-green-200 bg-green-200' : 'dark:hover:bg-emerald-700 dark:text-zinc-100'
							}`}
						>
							<span className="mr-4 dark:text-zinc-100">{song.name}</span>
							<span className="dark:text-zinc-400 text-zinc-500">{song.artists.join(', ')}</span>
						</li>
						)
					})}
        </ul>
			)}
		</div>
	);
};

export default Search;