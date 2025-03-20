import numpy as np

def compute_similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    return cosine_similarity

def embed(models, content):
    return models.embed_content(model="text-embedding-004", contents=content)

def combine_pos_neg_embeds(pos_vectors, neg_vectors):
    all_vectors = np.concatenate([pos_vectors, -neg_vectors], axis=0)
    return np.mean(all_vectors, axis=0)

def sort_by_similarity(liked_embeds, disliked_embeds, candidate_embeds, algorithm):
    if algorithm == "new":
        candidates = [(i, c, score_by_adding_scores(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    else:
        candidates = [(i, c, score_with_one_interest_embed(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates

def courses_codes_to_indices(courses_codes, ctoi):
    return [ctoi[code] for code in courses_codes]

def recommend_based_on_liked_disliked(liked, disliked, all_embeds, ctoi, n, algorithm="old"):
    liked_indices = courses_codes_to_indices(liked, ctoi)
    disliked_indices = courses_codes_to_indices(disliked, ctoi)
    liked_embeds = all_embeds[liked_indices]
    disliked_embeds = all_embeds[disliked_indices]
    res = [(i, _, sim) for i, _, sim in sort_by_similarity(liked_embeds, disliked_embeds, all_embeds, algorithm)][:n]
    return [i for i, _, _ in res], [sim for _, _, sim in res]

def score_with_one_interest_embed(liked_embeds, disliked_embeds, candidate_embed):
    combined_embed = combine_pos_neg_embeds(liked_embeds, disliked_embeds)
    return compute_similarity(combined_embed, candidate_embed)

def score_by_adding_scores(liked_embeds, disliked_embeds, candidate_embed):
    score = 0
    for liked_embed in liked_embeds:
        score += compute_similarity(liked_embed, candidate_embed) ** 2
    
    for disliked_embed in disliked_embeds:
        score -= 0.5 * compute_similarity(disliked_embed, candidate_embed) ** 2

    return score
