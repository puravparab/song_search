import os
import json
import numpy as np

"""
process song_ids and included genres.
return top k similar songs.
"""
def get_similarity(song_ids, genres, topk):
	embeddings_file = 'embeddings.json'

	if not os.path.exists(embeddings_file):
		return []

	# open file where embeddings are stored
	with open(embeddings_file, 'r') as file:
		embeddings_data = json.load(file)

	# filter out songs that don't match the genres
	filtered_embeddings = [embedding for embedding in embeddings_data if embedding['genre'] in genres]

	# if one song is provided
	if len(song_ids) == 1:
		song_id = song_ids[0]
		song_embedding = embeddings_data[song_id]["embedding"]
		if song_embedding is None:
			return []

	# if multiple songs are provided
	else:
		song_embeddings = [embedding['embedding'] for embedding in embeddings_data if embedding['id'] in song_ids]
		if len(song_embeddings) == 0:
			return []
		song_embedding = np.mean(song_embeddings, axis=0) # get average of the song embeddings

	embedding_matrix = np.array([embedding['embedding'] for embedding in filtered_embeddings if embedding['id'] not in song_ids])

	res = cosine_similarity(embedding_matrix, song_embedding)

	# Remove songs with a score of 1.0
	valid_indices = np.where(res < 1.0)[0]
	valid_scores = res[valid_indices]

	# Get the indices and scores of the top k similar songs
	top_k_indices = valid_indices[np.argsort(valid_scores)[-topk:][::-1]]
	top_k_scores = valid_scores[np.argsort(valid_scores)[-topk:][::-1]]
	# Return the IDs of the top k similar songs
	top_k_ids = [filtered_embeddings[i]['id'] for i in top_k_indices]
	return top_k_ids
	
"""
cosine similarity function
"""
def cosine_similarity(matrixA, vecB):
	dp = np.dot(matrixA, vecB)
	norm1 = np.linalg.norm(matrixA, axis=1)
	norm2 = np.linalg.norm(vecB)
	return dp / (norm1 * norm2)