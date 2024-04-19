import os
import json
import logging
from similarity import get_similarity

"""
entry point for the aws lambda function
"""
def lambda_handler(event, context):
	# get and parse request response (from API Gateway)
	body = json.loads(event['body'])

	try:
		if body["type"] == "metadata":
			return get_metadata(body["songs"])
		elif body["type"] == "recs":
			res = get_similarity(body["songs"], body["genres"], body["topk"])
			return get_metadata(res)

	except Exception as e:
		return {
			'statusCode': 500,
			'body': json.dumps({
				'error': 'request failed',
				'request': json.dumps(body)
			}),
		}

"""
return metadata for requested song Ids
"""
def get_metadata(song_id_arr):
	if song_id_arr == []:
		return {
			'statusCode': 404,
			'body': json.dumps({'error': 'songs not found'})
		}

	metadata_file = 'song_metadata.json'
	if os.path.exists(metadata_file):
		with open(metadata_file, 'r') as file:
			metadata = json.load(file)
		
		res = {"songs": [metadata[i] for i in song_id_arr]}
		return {
			'statusCode': 200,
			'body': json.dumps(res)
		}
	else:
		return {
			'statusCode': 500,
			'body': json.dumps({'error': 'request failed at retrieving metadata'})
		}