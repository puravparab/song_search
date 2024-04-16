"use client"
import { useState, useEffect } from 'react';

const Search: React.FC = () => {

	return (
		<div className="w-full">
			<input
        type="text"
        placeholder="Add songs ..."
        className="
					w-full px-4 py-2 border rounded-lg placeholder:text-zinc-500 text-base focus:ring-1
					dark:bg-zinc-800 dark:border-zinc-800 dark:focus:ring-zinc-800 dark:text-stone-100
					bg-white border-zinc-300 focus:outline-none focus:ring-zinc-500 text-black" 
      />
		</div>
	);
};

export default Search;