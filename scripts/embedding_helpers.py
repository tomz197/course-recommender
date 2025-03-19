import numpy as np

def similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    return cosine_similarity

def embed(models, content):
    return models.embed_content(model="text-embedding-004", contents=content)

def add_embeddings(pos_vectors, neg_vectors):
    all_vectors = np.concatenate([pos_vectors, -neg_vectors], axis=0)
    return np.mean(all_vectors, axis=0)

def sort_by_similarity(target, candidates):
    candidates = [(i, c, similarity(target, c)) for i, c in enumerate(candidates)]
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates

def courses_codes_to_indices(courses_codes, ctoi):
    return [ctoi[code] for code in courses_codes]

def recommend_based_on_liked_disliked(liked, disliked, all_embeds, ctoi, n):
    liked_indices = courses_codes_to_indices(liked, ctoi)
    disliked_indices = courses_codes_to_indices(disliked, ctoi)
    liked_embeds = all_embeds[liked_indices]
    disliked_embeds = all_embeds[disliked_indices]
    combined_embed = add_embeddings(liked_embeds, disliked_embeds)
    res = [(i, _, sim) for i, _, sim in sort_by_similarity(combined_embed, all_embeds)][:n]
    return [i for i, _, _ in res], [sim for _, _, sim in res]
