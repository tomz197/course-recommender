import numpy as np
from scripts.helpers import nice_dict_print

def similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    return cosine_similarity

def embed_nice_print(models, course):
    return models.embed_content(model="text-embedding-004", contents=nice_dict_print(course))

def add_embeddings(pos_vectors, neg_vectors):
    if len(neg_vectors) == 0:
        return np.mean(pos_vectors, axis=0)
    if len(pos_vectors) == 0:
        return -np.mean(neg_vectors, axis=0)
    # TODO: do we want to weight positive and negative vectors the same irrespective of the number of vectors?
    return np.mean(pos_vectors, axis=0) - np.mean(neg_vectors, axis=0)

def sort_by_similarity(target, candidates):
    candidates = [(i, c, similarity(target, c)) for i, c in enumerate(candidates)]
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates