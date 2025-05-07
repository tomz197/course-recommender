# MUNI Course Recommender

A recommendation system for Masaryk University (MUNI) courses leveraging natural language processing and machine learning techniques to suggest relevant courses based on user preferences.

## Project Overview

This project provides a comprehensive course recommendation system that helps students discover courses that match their interests. It employs multiple recommendation approaches:

1. **Embedding-based recommendations** - Uses text embeddings to find semantically similar courses
2. **Keyword-based recommendations** - Uses keyword intersection to suggest related courses
3. **TF-IDF based recommendations** - Utilizes term frequency-inverse document frequency for content-based filtering
4. **Personality-based recommendations** - Matches courses with student personality traits

## Repository Structure

### Data Analysis and Model Training
- `/notebooks/` - Jupyter notebooks for data analysis, embedding generation, and model evaluation
  - `simple-similarity.ipynb` - Keyword-based recommendation system
  - `create_embeddings.ipynb` - Text embedding generation and similarity analysis
  - `visualize_embeddings.ipynb` - Interactive visualization of course embeddings
  - `sentence_transformers.ipynb` - Experiments with transformer models
  - `tf_idf.ipynb` - TF-IDF based recommendation system
  - `personalities.ipynb` - Personality-based course matching
  - `test_algorithms.ipynb` - Evaluation of different recommendation algorithms

- `/notebooks/data/` - Data files used in analysis
  - `/formatted/` - Processed course data
  - `/generated/` - Generated data artifacts
  - `/embeddings/` - Stored course embeddings
  - `/intersects/` - Keyword intersection matrices

- `/notebooks/scripts/` - Helper scripts for notebooks
- `/notebooks/analysis/` - Additional analysis notebooks

### Web Application
- `/web/` - Web application for course recommendations
  - `docker-compose.yml` - Docker configuration for the entire web application
- `/web/backend/` - FastAPI-based backend service
- `/web/frontend/` - React/TypeScript frontend

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Python 3.8+ (for notebook development)
- Node.js and npm (for frontend development)

### Running the Web Application

1. Clone the repository:
   ```bash
   git clone https://github.com/tomz197/pv254-project.git
   cd pv254-project
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Copy `web/backend/.env.example` to `web/backend/.env`
   - Copy `web/frontend/.env.example` to `web/frontend/.env`

3. Start the application using Docker Compose:
   ```bash
   cd web
   docker-compose up --build
   ```

4. Access the web application at `http://localhost:8080`

### Running the Notebooks

1. Install required Python packages:
   ```bash
   pip install jupyter pandas numpy scikit-learn sentence-transformers matplotlib tqdm
   ```

2. Launch Jupyter:
   ```bash
   cd notebooks
   jupyter notebook
   ```

3. Open notebooks in your browser and run cells interactively

## Featured Notebooks

- `visualize_embeddings.ipynb` - An interactive visualization of course embeddings that demonstrates how different courses relate to each other in the embedding space
- `simple-similarity.ipynb` - A demonstration of keyword-based course recommendations
- `create_embeddings.ipynb` - The main notebook for generating course embeddings and evaluating recommendation quality
- `tf_idf.ipynb` - Implementation of TF-IDF based recommendations
- `personalities.ipynb` - Analysis of personality-based course matching
- `test_algorithms.ipynb` - Comprehensive evaluation of different recommendation approaches

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the terms of the license included in the repository.
